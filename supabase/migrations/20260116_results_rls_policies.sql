-- RLS para tabla results: Permitir que empleados inserten y admins lean
-- Fecha: 16 de enero de 2026

-- Habilitar RLS si no está habilitado
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;

-- Política 1: Los usuarios pueden insertar sus propios resultados
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT FROM pg_policies WHERE policyname = 'Users can insert their own results' AND tablename = 'results') THEN
        CREATE POLICY "Users can insert their own results" 
        ON public.results
        FOR INSERT 
        TO authenticated
        WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- Política 2: Los usuarios pueden ver sus propios resultados
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT FROM pg_policies WHERE policyname = 'Users can view their own results' AND tablename = 'results') THEN
        CREATE POLICY "Users can view their own results"
        ON public.results
        FOR SELECT
        TO authenticated
        USING (auth.uid() = user_id);
    END IF;
END $$;

-- Política 3: Los administradores pueden ver resultados de su empresa
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT FROM pg_policies WHERE policyname = 'Admins can view company results' AND tablename = 'results') THEN
        CREATE POLICY "Admins can view company results"
        ON public.results
        FOR SELECT
        TO authenticated
        USING (
            EXISTS (
                SELECT 1 FROM public.profiles AS viewer
                WHERE viewer.id = auth.uid()
                AND viewer.role IN ('super_admin', 'company_admin', 'rrhh', 'direccion')
                AND EXISTS (
                    SELECT 1 FROM public.profiles AS employee
                    WHERE employee.id = results.user_id
                    AND employee.company_id = viewer.company_id
                )
            )
        );
    END IF;
END $$;

-- Política 4: Super admins pueden ver todo
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT FROM pg_policies WHERE policyname = 'Super admins can view all results' AND tablename = 'results') THEN
        CREATE POLICY "Super admins can view all results"
        ON public.results
        FOR SELECT
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
COMMENT ON TABLE public.results IS 'Almacena los resultados de las encuestas completadas por los usuarios';
