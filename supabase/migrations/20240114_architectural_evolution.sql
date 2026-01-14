-- 🏗️ Evolución Arquitectónica: Áreas, Campañas, Reportes y Roles
-- Fecha: 14 de enero de 2026

-- 1. Actualización de Roles (Enums)
-- Nota: En Postgres no se puede agregar valores a un enum dentro de un bloque DO de forma directa sin precauciones.
-- Usamos ALTER TYPE fuera de bloques si es posible o manejamos la existencia.
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'rrhh';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'direccion';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'consultor_bs360';

-- 2. Tabla de Áreas / Sectores
CREATE TABLE IF NOT EXISTS public.areas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    estimated_employees INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(company_id, name)
);

-- Vincular Perfiles y Resultados a Áreas
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS area_id UUID REFERENCES public.areas(id) ON DELETE SET NULL;
ALTER TABLE public.results ADD COLUMN IF NOT EXISTS area_id UUID REFERENCES public.areas(id) ON DELETE SET NULL;

-- 3. Evolución de Evaluaciones (Campañas)
-- Agregamos estados y umbrales a company_surveys para convertirla en una "Campaña"
ALTER TABLE public.company_surveys ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'open', 'closed'));
ALTER TABLE public.company_surveys ADD COLUMN IF NOT EXISTS min_threshold INTEGER DEFAULT 5;
ALTER TABLE public.company_surveys ADD COLUMN IF NOT EXISTS name VARCHAR(255); -- Nombre de la campaña específico

-- 4. Tabla de Reportes (Indexación de PDFs)
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
    evaluation_id UUID REFERENCES public.company_surveys(id) ON DELETE CASCADE,
    area_id UUID REFERENCES public.areas(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    report_type VARCHAR(50) DEFAULT 'company', -- 'company', 'area', 'global'
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- 5. Tabla de Recomendaciones y Hallazgos (Persistencia de IA)
CREATE TABLE IF NOT EXISTS public.recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    evaluation_id UUID REFERENCES public.company_surveys(id) ON DELETE CASCADE,
    area_id UUID REFERENCES public.areas(id) ON DELETE SET NULL,
    domain VARCHAR(100) NOT NULL,
    construct VARCHAR(200),
    finding_text TEXT NOT NULL, -- El "Hallazgo"
    recommendation_text TEXT NOT NULL, -- La "Sugerencia de Acción"
    recommendation_type VARCHAR(50) DEFAULT 'action', -- 'quick_fix', 'long_term', 'policy'
    priority VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    source VARCHAR(20) DEFAULT 'ia', -- 'ia', 'manual'
    is_approved BOOLEAN DEFAULT false,
    approved_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Índices para optimización
CREATE INDEX IF NOT EXISTS idx_areas_company ON public.areas(company_id);
CREATE INDEX IF NOT EXISTS idx_profiles_area ON public.profiles(area_id);
CREATE INDEX IF NOT EXISTS idx_results_area ON public.results(area_id);
CREATE INDEX IF NOT EXISTS idx_reports_evaluation ON public.reports(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_evaluation ON public.recommendations(evaluation_id);

-- 7. RLS (Row Level Security)
ALTER TABLE public.areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;

-- Políticas básicas de lectura
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT FROM pg_policies WHERE policyname = 'Users can view areas from their company') THEN
        CREATE POLICY "Users can view areas from their company" ON public.areas
            FOR SELECT TO authenticated
            USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()));
    END IF;

    IF NOT EXISTS (SELECT FROM pg_policies WHERE policyname = 'Admins can manage reports') THEN
        CREATE POLICY "Admins can manage reports" ON public.reports
            FOR ALL TO authenticated
            USING (company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid() AND role IN ('super_admin', 'company_admin')));
    END IF;
END $$;
