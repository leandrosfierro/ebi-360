-- 🛡️ Security Audit Fix: Hardening Permissive Policies
-- Date: February 5th, 2026

-- 1. Hardening survey_responses
-- Currently: USING (true) for all authenticated users.
-- Fix: Only view responses if you own the result, are company admin of the respondent, or super admin.

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.survey_responses;

CREATE POLICY "Survey Responses: owner" ON public.survey_responses 
FOR SELECT TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.results r
        WHERE r.id = result_id AND r.user_id = auth.uid()
    )
);

CREATE POLICY "Survey Responses: company admin" ON public.survey_responses 
FOR SELECT TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.results r
        JOIN public.profiles p ON r.user_id = p.id
        WHERE r.id = result_id 
        AND p.company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
        AND ('company_admin' = ANY(SELECT roles FROM public.profiles WHERE id = auth.uid()))
    )
);

CREATE POLICY "Survey Responses: super admin" ON public.survey_responses 
FOR ALL TO authenticated 
USING (
    'super_admin' = ANY(SELECT roles FROM public.profiles WHERE id = auth.uid())
);

-- 2. Hardening surveys
-- Currently: USING (true) for all authenticated users.
-- Fix: Only view surveys that are either "base" or assigned to your company.

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
    'super_admin' = ANY(SELECT roles FROM public.profiles WHERE id = auth.uid())
);

-- 3. Hardening company_surveys
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.company_surveys;

CREATE POLICY "Company Surveys: visibility" ON public.company_surveys
FOR SELECT TO authenticated
USING (
    company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()) OR
    'super_admin' = ANY(SELECT roles FROM public.profiles WHERE id = auth.uid())
);
