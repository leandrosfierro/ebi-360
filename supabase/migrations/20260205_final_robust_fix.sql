-- 🏆 EBI 360: FINAL ROBUST ROLES & PERMISSIONS MIGRATION
-- This script consolidates all previous role fixes into a single source of truth.

-- 1. [ENUMS] SAFELY EXPAND USER ROLES
DO $$ 
BEGIN
    ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'rrhh';
    ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'direccion';
    ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'consultor_bs360';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. [PROFILES] NORMALIZE COLUMNS
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS roles public.user_role[] DEFAULT ARRAY['employee'::public.user_role];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS active_role public.user_role DEFAULT 'employee';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS admin_status text DEFAULT 'active';

-- Correct existing data nulls
UPDATE public.profiles SET roles = ARRAY[role] WHERE (roles IS NULL OR roles = '{}') AND role IS NOT NULL;
UPDATE public.profiles SET active_role = role WHERE active_role IS NULL AND role IS NOT NULL;

-- 3. [TRIGGER] BULLETPROOF HANDLE_NEW_USER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    role_to_set public.user_role;
    active_role_to_set public.user_role;
    initial_roles public.user_role[];
BEGIN
    -- Resilience: Log if metadata is missing (debugging)
    IF NEW.raw_user_meta_data IS NULL THEN
        RAISE WARNING 'User % created without metadata', NEW.id;
    END IF;

    -- Extract values with defaults
    role_to_set := COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'employee'::public.user_role);
    active_role_to_set := COALESCE((NEW.raw_user_meta_data->>'active_role')::public.user_role, role_to_set);
    initial_roles := ARRAY[role_to_set];
    
    -- Ensure employee is always present
    IF NOT ('employee'::public.user_role = ANY(initial_roles)) THEN
        initial_roles := array_append(initial_roles, 'employee'::public.user_role);
    END IF;

    INSERT INTO public.profiles (
        id, 
        email, 
        full_name, 
        role, 
        roles, 
        active_role, 
        admin_status,
        company_id
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        role_to_set,
        initial_roles,
        active_role_to_set,
        'active',
        (NULLIF(NEW.raw_user_meta_data->>'company_id', ''))::uuid
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
        company_id = COALESCE(EXCLUDED.company_id, public.profiles.company_id),
        roles = ARRAY(SELECT DISTINCT r FROM UNNEST(ARRAY_CAT(public.profiles.roles, EXCLUDED.roles)) r),
        active_role = EXCLUDED.active_role,
        admin_status = EXCLUDED.admin_status,
        updated_at = NOW();
    
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Trigger handle_new_user error for user %: %', NEW.id, SQLERRM;
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (NEW.id, NEW.email, split_part(NEW.email, '@', 1), 'employee')
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. [RLS] NORMALIZE POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profiles: view self" ON public.profiles;
CREATE POLICY "Profiles: view self" ON public.profiles 
FOR SELECT TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "Profiles: update self" ON public.profiles;
CREATE POLICY "Profiles: update self" ON public.profiles 
FOR UPDATE TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "Profiles: super_admin all" ON public.profiles;
CREATE POLICY "Profiles: super_admin all" ON public.profiles 
FOR ALL TO authenticated 
USING (
    'super_admin' = ANY(roles) OR 
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'super_admin'
);

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles 
FOR SELECT TO authenticated USING (true);
