-- 🛡️ Integridad de Datos: Sincronización de Roles y Robustez de Perfiles
-- Fecha: 23 de enero de 2026

-- 1. Función de Sincronización de Roles
-- Esta función asegura que los campos 'role' (legacy), 'roles' (array) y 'active_role' estén siempre alineados.
CREATE OR REPLACE FUNCTION public.sync_user_roles()
RETURNS TRIGGER AS $$
BEGIN
    -- Si se actualizó 'roles' (array), sincronizar 'role' y 'active_role'
    IF (TG_OP = 'INSERT' OR NEW.roles IS DISTINCT FROM OLD.roles) AND NEW.roles IS NOT NULL AND array_length(NEW.roles, 1) > 0 THEN
        NEW.role := NEW.roles[1];
        -- Si active_role no está en el nuevo array, resetearlo al principal
        IF NEW.active_role IS NULL OR NOT (NEW.active_role = ANY(NEW.roles)) THEN
            NEW.active_role := NEW.roles[1];
        END IF;
    -- Si se actualizó 'role' (legacy), asegurar que esté en el array
    ELSIF (TG_OP = 'INSERT' OR NEW.role IS DISTINCT FROM OLD.role) AND NEW.role IS NOT NULL THEN
        IF NEW.roles IS NULL OR NOT (NEW.role = ANY(NEW.roles)) THEN
            NEW.roles := array_append(COALESCE(NEW.roles, ARRAY[]::user_role[]), NEW.role);
        END IF;
        IF NEW.active_role IS NULL THEN
            NEW.active_role := NEW.role;
        END IF;
    END IF;

    -- Asegurar que updated_at siempre se actualice
    NEW.updated_at := NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Trigger para Sincronización Automática
DROP TRIGGER IF EXISTS tr_sync_user_roles ON public.profiles;
CREATE TRIGGER tr_sync_user_roles
    BEFORE INSERT OR UPDATE OF role, roles, active_role
    ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_user_roles();

-- 3. Sanitización de Datos Existentes
-- Primero, normalizar active_role y role para todos
UPDATE public.profiles
SET 
    active_role = COALESCE(active_role, role, 'employee'::user_role),
    role = COALESCE(role, active_role, 'employee'::user_role);

-- Luego, arreglar los que no tienen roles array
UPDATE public.profiles
SET roles = ARRAY[role]
WHERE roles IS NULL OR array_length(roles, 1) = 0 OR array_length(roles, 1) IS NULL;

-- 4. Asegurar que Super Admins autorizados tengan acceso total (por si acaso)
-- Nota: Esto usa la lista manual de emails definidos en el sistema
UPDATE public.profiles
SET 
    role = 'super_admin',
    roles = ARRAY['super_admin'::user_role, 'company_admin'::user_role, 'employee'::user_role],
    active_role = 'super_admin'
WHERE email IN (
    'leandro.fierro@bs360.com.ar',
    'carlos.menvielle@bs360.com.ar',
    'carlos.menvielle@gmail.com',
    'carlitosmenvielle@gmail.com',
    'admin@bs360.com',
    'admin@bs360.com.ar',
    'soporte@bs360.com.ar'
);

-- 5. Comentarios de Documentación
COMMENT ON FUNCTION public.sync_user_roles() IS 'Mantiene la consistencia atómica entre role, roles[] y active_role';
COMMENT ON TRIGGER tr_sync_user_roles ON public.profiles IS 'Garantiza que cualquier cambio en roles se refleje en toda la estructura del perfil';
