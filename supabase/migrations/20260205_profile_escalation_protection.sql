-- 🛡️ Profile Protection: Preventing Role Escalation
-- Date: February 5th, 2026

CREATE OR REPLACE FUNCTION public.protect_profile_critical_columns()
RETURNS TRIGGER AS $$
DECLARE
    is_super_admin BOOLEAN;
    is_service_role BOOLEAN;
BEGIN
    -- 1. Identify caller
    -- Service role (admin client) is always allowed
    is_service_role := (auth.jwt() ->> 'role' = 'service_role');
    
    -- Check if the actual session user is a super_admin
    -- We look at user_metadata first as it's the fast path in Supabase
    is_super_admin := (auth.jwt() -> 'user_metadata' ->> 'active_role' = 'super_admin');

    -- If not service role and not super_admin, block changes to critical columns
    IF NOT is_service_role AND NOT is_super_admin THEN
        IF NEW.roles IS DISTINCT FROM OLD.roles THEN
            RAISE EXCEPTION 'No tenés permisos para modificar los roles asignados.';
        END IF;
        
        IF NEW.role IS DISTINCT FROM OLD.role THEN
            RAISE EXCEPTION 'No tenés permisos para modificar el rol principal.';
        END IF;

        IF NEW.company_id IS DISTINCT FROM OLD.company_id THEN
            RAISE EXCEPTION 'No tenés permisos para cambiar la empresa asociada.';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply trigger
DROP TRIGGER IF EXISTS tr_protect_profile_critical_columns ON public.profiles;
CREATE TRIGGER tr_protect_profile_critical_columns
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.protect_profile_critical_columns();
