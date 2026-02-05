-- 🛡️ Robust User Handling - v2.0
-- This migration updates the user creation trigger to be more production-ready.

-- 1. Ensure enum exists (safety check)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('super_admin', 'company_admin', 'employee', 'rrhh', 'direccion', 'consultor_bs360');
    END IF;
END $$;

-- 2. Improved handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    role_to_set user_role;
    active_role_to_set user_role;
    initial_roles user_role[];
BEGIN
    -- Extract values from metadata with defaults
    role_to_set := COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'employee'::user_role);
    active_role_to_set := COALESCE((NEW.raw_user_meta_data->>'active_role')::user_role, role_to_set);
    initial_roles := ARRAY[role_to_set];
    
    -- Safety: Ensure employee is always in roles if not already
    IF NOT ('employee'::user_role = ANY(initial_roles)) THEN
        initial_roles := array_append(initial_roles, 'employee'::user_role);
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
        COALESCE(NEW.raw_user_meta_data->>'admin_status', 'active'),
        (NEW.raw_user_meta_data->>'company_id')::uuid
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
        -- Update company_id if provided, otherwise keep existing
        company_id = COALESCE(EXCLUDED.company_id, public.profiles.company_id),
        -- Merge roles and ensure active_role is elevated to highest
        role = EXCLUDED.role,
        roles = (
            SELECT ARRAY_AGG(DISTINCT r)
            FROM UNNEST(ARRAY_CAT(public.profiles.roles, EXCLUDED.roles)) r
        ),
        active_role = EXCLUDED.active_role,
        admin_status = EXCLUDED.admin_status,
        updated_at = NOW();
    
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Resilient fallback: Never block the Auth flow
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, split_part(NEW.email, '@', 1))
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
