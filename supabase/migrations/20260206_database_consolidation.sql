-- ======================================
-- EBI-360: DATABASE CONSOLIDATION
-- Phase 1: Definitive Trigger & RLS Cleanup
-- Date: 2026-02-06
-- ======================================

-- This migration consolidates all conflicting triggers and policies
-- into canonical versions with clear, predictable behavior.

BEGIN;

-- ======================================
-- 1. TRIGGER CLEANUP
-- ======================================

-- Drop ALL existing triggers (clean slate approach)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS tr_sync_user_roles ON public.profiles;
DROP TRIGGER IF EXISTS tr_protect_profile_critical_columns ON public.profiles;
DROP TRIGGER IF EXISTS tr_protect_role_escalation ON public.profiles;

-- ======================================
-- 2. CANONICAL PROFILE CREATION TRIGGER
-- ======================================

CREATE OR REPLACE FUNCTION public.handle_auth_user_created()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (
        id,
        email,
        full_name,
        role,
        roles,
        active_role,
        company_id,
        admin_status
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'role', 'employee'),
        COALESCE(
            ARRAY(SELECT jsonb_array_elements_text(NEW.raw_user_meta_data->'roles')),
            ARRAY[COALESCE(NEW.raw_user_meta_data->>'role', 'employee')]
        ),
        COALESCE(
            NEW.raw_user_meta_data->>'active_role',
            NEW.raw_user_meta_data->>'role',
            'employee'
        ),
        (NEW.raw_user_meta_data->>'company_id')::uuid,
        COALESCE(NEW.raw_user_meta_data->>'admin_status', 'active')
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
        roles = EXCLUDED.roles,
        active_role = EXCLUDED.active_role,
        company_id = COALESCE(EXCLUDED.company_id, public.profiles.company_id),
        admin_status = COALESCE(EXCLUDED.admin_status, public.profiles.admin_status);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_auth_user_created();

-- ======================================
-- 3. CANONICAL ROLE PROTECTION TRIGGER
-- ======================================

CREATE OR REPLACE FUNCTION public.protect_role_escalation()
RETURNS TRIGGER AS $$
DECLARE
    caller_role TEXT;
    is_service BOOLEAN;
    master_emails TEXT[] := ARRAY[
        'leandro.fierro@bs360.com.ar',
        'carlos.menvielle@bs360.com.ar',
        'leandrosfierro@gmail.com'
    ];
BEGIN
    -- Detect service role (admin client)
    caller_role := current_setting('role', true);
    is_service := (caller_role IN ('service_role', 'supabase_admin', 'postgres'));
    
    -- BYPASS: Service role can modify anything
    IF is_service THEN
        RETURN NEW;
    END IF;
    
    -- BYPASS: Master admins can modify their own profiles
    IF LOWER(OLD.email) = ANY(master_emails) AND auth.uid() = OLD.id THEN
        RETURN NEW;
    END IF;
    
    -- RESTRICTION: Block critical column changes for non-admins
    IF NEW.roles IS DISTINCT FROM OLD.roles THEN
        RAISE EXCEPTION 'Cannot modify roles array without admin privileges';
    END IF;
    
    IF NEW.role IS DISTINCT FROM OLD.role THEN
        RAISE EXCEPTION 'Cannot modify primary role without admin privileges';
    END IF;
    
    IF NEW.company_id IS DISTINCT FROM OLD.company_id THEN
        RAISE EXCEPTION 'Cannot modify company assignment without admin privileges';
    END IF;
    
    -- ALLOWED: active_role changes (for role switching UI)
    -- ALLOWED: metadata changes (full_name, etc)
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER tr_protect_role_escalation
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.protect_role_escalation();

-- ======================================
-- 4. RLS POLICY CLEANUP
-- ======================================

-- Drop ALL existing profile policies (clean slate)
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN
        SELECT policyname
        FROM pg_policies
        WHERE tablename = 'profiles' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', policy_record.policyname);
    END LOOP;
END$$;

-- ======================================
-- 5. CANONICAL RLS POLICIES
-- ======================================

-- Policy 1: Users can view their own profile
CREATE POLICY "profiles_select_own"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

-- Policy 2: Users can update their own profile (with trigger protection)
CREATE POLICY "profiles_update_own"
    ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

-- Policy 3: Admins have full access to all profiles
CREATE POLICY "profiles_admin_all"
    ON public.profiles
    FOR ALL
    TO authenticated
    USING (
        -- Super admin check (in roles array OR active_role)
        'super_admin' = ANY(
            COALESCE(
                (SELECT roles FROM public.profiles WHERE id = auth.uid()),
                ARRAY[]::text[]
            )
        )
        OR
        (SELECT active_role FROM public.profiles WHERE id = auth.uid()) = 'super_admin'
    );

-- Policy 4: Company members can view profiles in their company
CREATE POLICY "profiles_company_read"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (
        company_id IN (
            SELECT company_id 
            FROM public.profiles 
            WHERE id = auth.uid()
            LIMIT 1
        )
    );

-- ======================================
-- 6. VALIDATION CHECKS
-- ======================================

-- Ensure all users have at least 'employee' in their roles array
DO $$
DECLARE
    affected_count INT;
BEGIN
    UPDATE public.profiles
    SET roles = ARRAY['employee']
    WHERE roles IS NULL OR array_length(roles, 1) IS NULL;
    
    GET DIAGNOSTICS affected_count = ROW_COUNT;
    RAISE NOTICE 'Fixed % profiles with empty roles array', affected_count;
END$$;

-- Ensure active_role is in roles array (or fix it)
DO $$
DECLARE
    affected_count INT;
BEGIN
    UPDATE public.profiles
    SET active_role = CASE
        WHEN 'super_admin' = ANY(roles) THEN 'super_admin'
        WHEN 'company_admin' = ANY(roles) THEN 'company_admin'
        WHEN 'rrhh' = ANY(roles) THEN 'rrhh'
        WHEN 'consultor_bs360' = ANY(roles) THEN 'consultor_bs360'
        ELSE 'employee'
    END
    WHERE active_role IS NULL 
       OR NOT (active_role = ANY(roles));
    
    GET DIAGNOSTICS affected_count = ROW_COUNT;
    RAISE NOTICE 'Fixed % profiles with invalid active_role', affected_count;
END$$;

-- ======================================
-- 7. VERIFICATION
-- ======================================

-- Verify trigger count
DO $$
DECLARE
    trigger_count INT;
BEGIN
    SELECT COUNT(*) INTO trigger_count
    FROM pg_trigger
    WHERE tgrelid = 'public.profiles'::regclass
    AND tgname IN ('on_auth_user_created', 'tr_protect_role_escalation');
    
    IF trigger_count != 2 THEN
        RAISE EXCEPTION 'Expected exactly 2 triggers on profiles, found %', trigger_count;
    END IF;
    
    RAISE NOTICE 'Trigger verification: PASSED (2 triggers)';
END$$;

-- Verify policy count
DO $$
DECLARE
    policy_count INT;
BEGIN
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE tablename = 'profiles' AND schemaname = 'public';
    
    IF policy_count != 4 THEN
        RAISE EXCEPTION 'Expected exactly 4 RLS policies on profiles, found %', policy_count;
    END IF;
    
    RAISE NOTICE 'RLS Policy verification: PASSED (4 policies)';
END$$;

COMMIT;

-- ======================================
-- MIGRATION COMPLETE
-- ======================================

-- Summary:
-- ✅ Removed all conflicting triggers
-- ✅ Created 2 canonical triggers (profile creation + role protection)
-- ✅ Cleaned up redundant RLS policies
-- ✅ Created 4 minimal necessary policies
-- ✅ Fixed data integrity issues (empty roles arrays, invalid active_role)
-- ✅ Verified database state

RAISE NOTICE '==================================================';
RAISE NOTICE 'Database consolidation complete!';
RAISE NOTICE 'Triggers: 2 (profile creation, role protection)';
RAISE NOTICE 'RLS Policies: 4 (own select/update, admin all, company read)';
RAISE NOTICE '==================================================';
