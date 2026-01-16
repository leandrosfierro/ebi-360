-- RLS para tabla profiles: Control de acceso por empresa
-- Fecha: 16 de enero de 2026

-- Habilitar RLS si no está habilitado
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Política 1: Los usuarios pueden ver su propio perfil
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT FROM pg_policies WHERE policyname = 'Users can view their own profile' AND tablename = 'profiles') THEN
        CREATE POLICY "Users can view their own profile"
        ON public.profiles
        FOR SELECT
        TO authenticated
        USING (auth.uid() = id);
    END IF;
END $$;

-- Política 2: Los usuarios pueden actualizar su propio perfil
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT FROM pg_policies WHERE policyname = 'Users can update their own profile' AND tablename = 'profiles') THEN
        CREATE POLICY "Users can update their own profile"
        ON public.profiles
        FOR UPDATE
        TO authenticated
        USING (auth.uid() = id);
    END IF;
END $$;

-- Política 3: Los administradores pueden ver perfiles de su empresa
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT FROM pg_policies WHERE policyname = 'Admins can view company profiles' AND tablename = 'profiles') THEN
        CREATE POLICY "Admins can view company profiles"
        ON public.profiles
        FOR SELECT
        TO authenticated
        USING (
            company_id IN (
                SELECT company_id FROM public.profiles 
                WHERE id = auth.uid() 
                AND role IN ('super_admin', 'company_admin', 'rrhh', 'direccion')
            )
        );
    END IF;
END $$;

-- Política 4: Super admins pueden ver todos los perfiles
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT FROM pg_policies WHERE policyname = 'Super admins can view all profiles' AND tablename = 'profiles') THEN
        CREATE POLICY "Super admins can view all profiles"
        ON public.profiles
        FOR ALL
        TO authenticated
        USING (
            EXISTS (
                SELECT 1 FROM public.profiles
                WHERE id = auth.uid()
                AND role = 'super_admin'
            )
        );
    END IF;
END $$;

-- Comentario
COMMENT ON TABLE public.profiles IS 'Perfiles de usuarios con control de acceso por empresa';
