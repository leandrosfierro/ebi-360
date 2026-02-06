-- 🛡️ EBI 360: TRIGGER ROBUSTNESS FIX V2
-- This is the definitive fix for the role-protection trigger.

CREATE OR REPLACE FUNCTION public.protect_profile_critical_columns()
RETURNS TRIGGER AS $$
DECLARE
    is_super_admin BOOLEAN := false;
    is_service_role BOOLEAN := false;
    caller_role TEXT;
    jwt_active_role TEXT;
BEGIN
    -- 1. Identify if it's the SERVICE ROLE (admin client)
    -- In Supabase, service_role key requests have 'service_role' or 'supabase_admin' role.
    caller_role := current_setting('role', true);
    is_service_role := (caller_role IN ('service_role', 'supabase_admin'));
    
    -- 2. Identify if it's a SUPER ADMIN user
    -- We check the JWT metadata for the active_role
    BEGIN
        jwt_active_role := auth.jwt() -> 'user_metadata' ->> 'active_role';
        is_super_admin := (jwt_active_role = 'super_admin');
    EXCEPTION WHEN OTHERS THEN
        is_super_admin := false;
    END;

    -- 3. BYPASS: If service role or super_admin, allow ALL changes
    IF is_service_role OR is_super_admin THEN
        RETURN NEW;
    END IF;

    -- 4. RESTRICTION: Block critical columns for everyone else
    -- Critical columns: roles, role, company_id
    -- We allow updating active_role (the user's current session intent) 
    -- and metadata like full_name, etc.

    IF NEW.roles IS DISTINCT FROM OLD.roles THEN
        RAISE EXCEPTION 'No tenés permisos para modificar los roles asignados (Rol: %).', caller_role;
    END IF;
    
    IF NEW.role IS DISTINCT FROM OLD.role THEN
        RAISE EXCEPTION 'No tenés permisos para modificar el rol principal.';
    END IF;

    IF NEW.company_id IS DISTINCT FROM OLD.company_id THEN
        RAISE EXCEPTION 'No tenés permisos para cambiar la empresa asociada.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-apply trigger
DROP TRIGGER IF EXISTS tr_protect_profile_critical_columns ON public.profiles;
CREATE TRIGGER tr_protect_profile_critical_columns
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.protect_profile_critical_columns();
