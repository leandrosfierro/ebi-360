-- 🛡️ EBI 360: TRIGGER ROBUSTNESS FIX
-- Ensures service_role and super_admin checks are bulletproof in the trigger.

CREATE OR REPLACE FUNCTION public.protect_profile_critical_columns()
RETURNS TRIGGER AS $$
DECLARE
    is_super_admin BOOLEAN := false;
    is_service_role BOOLEAN := false;
    caller_role TEXT;
BEGIN
    -- 1. Identify caller via standard role check
    caller_role := current_setting('role', true);
    is_service_role := (caller_role = 'service_role');
    
    -- 2. Check if super_admin in JWT metadata
    is_super_admin := (auth.jwt() -> 'user_metadata' ->> 'active_role' = 'super_admin');

    -- 3. BYPASS: If service role or super_admin, allow all changes
    IF is_service_role OR is_super_admin THEN
        RETURN NEW;
    END IF;

    -- 4. RESTRICTION: Block critical columns for everyone else
    -- Note: We allow updating 'active_role' and 'last_active_at' freely
    IF NEW.roles IS DISTINCT FROM OLD.roles THEN
        RAISE EXCEPTION 'No tenés permisos para modificar los roles asignados.';
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
