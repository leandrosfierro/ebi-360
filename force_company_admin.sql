-- Script para forzar rol de Company Admin y asignar empresa
DO $$
DECLARE
    target_company_id uuid;
BEGIN
    -- 1. Buscar una empresa existente o crear una
    SELECT id INTO target_company_id FROM public.companies LIMIT 1;

    IF target_company_id IS NULL THEN
        INSERT INTO public.companies (name, subscription_plan, active)
        VALUES ('Empresa Demo', 'enterprise', true)
        RETURNING id INTO target_company_id;
    END IF;

    -- 2. Actualizar usuario
    UPDATE public.profiles
    SET 
        active_role = 'company_admin',
        company_id = target_company_id,
        -- Nos aseguramos de no borrar super_admin de tus permisos, solo agregamos company_admin si falta
        roles = (
            SELECT array_agg(DISTINCT x) 
            FROM unnest(array_cat(roles, ARRAY['company_admin']::user_role[])) t(x)
        )
    WHERE email = 'leandro.fierro@bs360.com.ar';

    RAISE NOTICE 'Rol activo cambiado a company_admin para la empresa %', target_company_id;
END $$;
