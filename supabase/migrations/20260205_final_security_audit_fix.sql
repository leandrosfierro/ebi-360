-- 🛡️ EBI 360: FINAL SECURITY HARDENING MIGRATION
-- Date: February 5th, 2026
-- Description: Consolidates RLS hardening and Role Escalation Protection.

-- =====================================================================
-- 1. [PROTECTION] PREVENT UNAUTHORIZED ROLE ESCALATION
-- =====================================================================

CREATE OR REPLACE FUNCTION public.protect_profile_critical_columns()
RETURNS TRIGGER AS $$
DECLARE
    is_super_admin BOOLEAN;
    is_service_role BOOLEAN;
BEGIN
    -- Identify caller
    is_service_role := (auth.jwt() ->> 'role' = 'service_role');
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

DROP TRIGGER IF EXISTS tr_protect_profile_critical_columns ON public.profiles;
CREATE TRIGGER tr_protect_profile_critical_columns
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.protect_profile_critical_columns();


-- =====================================================================
-- 2. [RLS] HARDENING PERMISSIVE POLICIES
-- =====================================================================

-- 🛡️ survey_responses: Narrow visibility
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.survey_responses;

CREATE POLICY "Survey Responses: owner" ON public.survey_responses 
FOR SELECT TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.results r
        WHERE r.id = result_id AND r.user_id = auth.uid()
    )
);

CREATE POLICY "Survey Responses: access for admins" ON public.survey_responses 
FOR SELECT TO authenticated 
USING (
    -- Admins can only see responses from their company
    EXISTS (
        SELECT 1 FROM public.results r
        JOIN public.profiles p ON r.user_id = p.id
        WHERE r.id = result_id 
        AND p.company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
        AND ('company_admin' = ANY (SELECT unnest(roles) FROM public.profiles WHERE id = auth.uid()))
    ) OR
    -- Super admins see all
    'super_admin' = ANY (SELECT unnest(roles) FROM public.profiles WHERE id = auth.uid())
);

-- 🛡️ surveys: Restricted visibility
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.surveys;

CREATE POLICY "Surveys: visibility" ON public.surveys
FOR SELECT TO authenticated
USING (
    is_base = true OR
    EXISTS (
        SELECT 1 FROM public.company_surveys cs
        WHERE cs.survey_id = surveys.id
        AND cs.company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    ) OR
    'super_admin' = ANY (SELECT unnest(roles) FROM public.profiles WHERE id = auth.uid())
);

-- 🛡️ company_surveys: Isolated visibility
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.company_surveys;

CREATE POLICY "Company Surveys: visibility" ON public.company_surveys
FOR SELECT TO authenticated
USING (
    company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()) OR
    'super_admin' = ANY (SELECT unnest(roles) FROM public.profiles WHERE id = auth.uid())
);

-- =====================================================================
-- 3. [AUDIT] CLEAN UP
-- =====================================================================
-- Ensure even if RLS was off, it's now on
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
