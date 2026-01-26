-- 🛡️ RLS Stabilization: Unified Multi-role Access Control
-- Fecha: 26 de enero de 2026

-- 1. Eliminar políticas antiguas para evitar conflictos
DROP POLICY IF EXISTS "Admins can view company profiles" ON public.profiles;
DROP POLICY IF EXISTS "Super admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- 2. Políticas para tabla PROFILES

-- Los usuarios pueden ver y editar su propio perfil siempre
CREATE POLICY "Profiles: view self" ON public.profiles 
FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "Profiles: update self" ON public.profiles 
FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Super Admins: Acceso total (usando array roles)
CREATE POLICY "Profiles: super admin all" ON public.profiles 
FOR ALL TO authenticated 
USING (
    'super_admin' = ANY(roles) OR 
    role = 'super_admin' OR 
    active_role = 'super_admin'
);

-- Company Admins: Ver perfiles de su misma empresa
-- Nota: Usamos una subquery directa pero optimizada
CREATE POLICY "Profiles: company admin view company" ON public.profiles 
FOR SELECT TO authenticated 
USING (
    company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()) AND
    (
        'company_admin' = ANY(SELECT roles FROM public.profiles WHERE id = auth.uid()) OR
        'super_admin' = ANY(SELECT roles FROM public.profiles WHERE id = auth.uid())
    )
);

-- 3. Políticas para tabla RESULTS (Estabilización)
DROP POLICY IF EXISTS "Users can view their own results" ON public.results;
DROP POLICY IF EXISTS "Admins can view company results" ON public.results;

CREATE POLICY "Results: view self" ON public.results 
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Results: company admin view company" ON public.results 
FOR SELECT TO authenticated 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = auth.uid() 
        AND p.company_id = (SELECT company_id FROM public.profiles WHERE id = results.user_id)
        AND ('company_admin' = ANY(p.roles) OR 'super_admin' = ANY(p.roles))
    )
);

-- 4. Permitir INSERT de resultados a cualquier autenticado (el trigger y el código validan integridad)
DROP POLICY IF EXISTS "Users can insert their own results" ON public.results;
CREATE POLICY "Results: insert self" ON public.results
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Comentario final
COMMENT ON TABLE public.profiles IS 'Políticas RLS actualizadas el 26 de enero para soporte multi-rol.';
