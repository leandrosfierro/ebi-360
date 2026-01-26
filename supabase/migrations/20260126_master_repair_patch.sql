-- 🛡️ PATCH MAESTRO: Estabilización Total de Seguridad y Accesos
-- Fecha: 26 de enero de 2026 (16:30)

-- 1. Habilitar RLS en todas las tablas críticas
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- 2. Limpieza de políticas existentes para evitar duplicados
DO $$ 
DECLARE
    t text;
BEGIN
    FOR t IN SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "SuperAdmin: Full Access" ON public.' || t;
        EXECUTE 'DROP POLICY IF EXISTS "Profiles: super admin all" ON public.' || t; -- Limpiar nombres anteriores
    END LOOP;
END $$;

-- 3. POLÍTICA UNIVERSAL PARA SUPER ADMINS
-- Esta política otorga acceso TOTAL a cualquier tabla si el usuario tiene el rol de super_admin
DO $$ 
DECLARE
    t text;
BEGIN
    FOR t IN SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'
    LOOP
        -- Política simplificada y robusta usando ANY sobre el array de roles
        EXECUTE format('CREATE POLICY "SuperAdmin: Full Access" ON public.%I FOR ALL TO authenticated 
            USING (
                ''super_admin'' = ANY((SELECT roles FROM public.profiles WHERE id = auth.uid())::text[]) OR 
                (SELECT role FROM public.profiles WHERE id = auth.uid())::text = ''super_admin''
            )', t);
    END LOOP;
END $$;

-- 4. POLÍTICAS ESPECÍFICAS PARA OTROS ROLES (Continuidad de negocio)

-- PROFILES
DROP POLICY IF EXISTS "Profiles: view self" ON public.profiles;
CREATE POLICY "Profiles: view self" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
DROP POLICY IF EXISTS "Profiles: update self" ON public.profiles;
CREATE POLICY "Profiles: update self" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- RESULTS
DROP POLICY IF EXISTS "Results: view self" ON public.results;
CREATE POLICY "Results: view self" ON public.results FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Results: insert self" ON public.results;
CREATE POLICY "Results: insert self" ON public.results FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- 5. REPARACIÓN DEL TRIGGER DE LOGIN/REGISTRO
-- Corrige el error "Database error saving new user" al ser más tolerante y manejar multi-rol
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, roles, active_role, admin_status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    'employee',
    ARRAY['employee'::user_role],
    'employee',
    'active'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. RESTAURACIÓN DE NOMBRES PARA SUPER ADMINS
UPDATE public.profiles SET full_name = 'Leandro Fierro' WHERE email = 'leandro.fierro@bs360.com.ar';
UPDATE public.profiles SET full_name = 'Carlos Menvielle' WHERE email = 'carlos.menvielle@bs360.com.ar';

-- 7. COMENTARIO DE ÉXITO
COMMENT ON TABLE public.profiles IS 'Seguridad blindada y funcional. Patch v1.1 aplicado.';
