-- 📊 Sistema de Encuestas Modulares - EBI 360
-- Fecha: 23 de Diciembre de 2025

-- 1. Tabla de Encuestas (surveys)
-- Manejamos el caso donde ya existe una tabla surveys con esquema antiguo
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'surveys') THEN
        CREATE TABLE surveys (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            code VARCHAR(50) UNIQUE NOT NULL,
            name VARCHAR(200) NOT NULL,
            description TEXT,
            survey_type VARCHAR(50) NOT NULL DEFAULT 'custom',
            category VARCHAR(100),
            country_code VARCHAR(3),
            regulation_name VARCHAR(200),
            version VARCHAR(20) NOT NULL DEFAULT '1.0',
            status VARCHAR(20) DEFAULT 'draft',
            is_base BOOLEAN DEFAULT false,
            is_mandatory BOOLEAN DEFAULT false,
            calculation_algorithm JSONB DEFAULT '{}'::jsonb,
            scoring_config JSONB DEFAULT '{}'::jsonb,
            source_file_url TEXT,
            source_file_name VARCHAR(255),
            created_by UUID,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            published_at TIMESTAMP WITH TIME ZONE,
            archived_at TIMESTAMP WITH TIME ZONE,
            CONSTRAINT valid_status CHECK (status IN ('draft', 'active', 'archived')),
            CONSTRAINT valid_type CHECK (survey_type IN ('base', 'regulatory', 'custom'))
        );
    ELSE
        -- La tabla existe, aseguramos que tenga todas las columnas necesarias
        -- Si existe la columna 'title' antigua, le quitamos el NOT NULL
        IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'surveys' AND column_name = 'title') THEN
            ALTER TABLE surveys ALTER COLUMN title DROP NOT NULL;
        END IF;

        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'surveys' AND column_name = 'code') THEN
            ALTER TABLE surveys ADD COLUMN code VARCHAR(50);
        END IF;

        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'surveys' AND column_name = 'name') THEN
            ALTER TABLE surveys ADD COLUMN name VARCHAR(200);
            -- Migrar datos de title a name si es posible
            IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'surveys' AND column_name = 'title') THEN
                UPDATE surveys SET name = title WHERE name IS NULL;
            END IF;
        END IF;

        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'surveys' AND column_name = 'description') THEN
            ALTER TABLE surveys ADD COLUMN description TEXT;
        END IF;

        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'surveys' AND column_name = 'survey_type') THEN
            ALTER TABLE surveys ADD COLUMN survey_type VARCHAR(50) DEFAULT 'custom';
        END IF;

        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'surveys' AND column_name = 'category') THEN
            ALTER TABLE surveys ADD COLUMN category VARCHAR(100);
        END IF;

        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'surveys' AND column_name = 'country_code') THEN
            ALTER TABLE surveys ADD COLUMN country_code VARCHAR(3);
        END IF;

        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'surveys' AND column_name = 'regulation_name') THEN
            ALTER TABLE surveys ADD COLUMN regulation_name VARCHAR(200);
        END IF;

        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'surveys' AND column_name = 'version') THEN
            ALTER TABLE surveys ADD COLUMN version VARCHAR(20) DEFAULT '1.0';
        END IF;

        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'surveys' AND column_name = 'status') THEN
            ALTER TABLE surveys ADD COLUMN status VARCHAR(20) DEFAULT 'draft';
            -- Migrar active boolean a status string si existe
            IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'surveys' AND column_name = 'active') THEN
                UPDATE surveys SET status = 'active' WHERE active = true;
                UPDATE surveys SET status = 'archived' WHERE active = false;
            END IF;
        END IF;

        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'surveys' AND column_name = 'is_base') THEN
            ALTER TABLE surveys ADD COLUMN is_base BOOLEAN DEFAULT false;
        END IF;

        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'surveys' AND column_name = 'is_mandatory') THEN
            ALTER TABLE surveys ADD COLUMN is_mandatory BOOLEAN DEFAULT false;
        END IF;

        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'surveys' AND column_name = 'calculation_algorithm') THEN
            ALTER TABLE surveys ADD COLUMN calculation_algorithm JSONB DEFAULT '{}'::jsonb;
        END IF;

        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'surveys' AND column_name = 'scoring_config') THEN
            ALTER TABLE surveys ADD COLUMN scoring_config JSONB DEFAULT '{}'::jsonb;
        END IF;

        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'surveys' AND column_name = 'source_file_url') THEN
            ALTER TABLE surveys ADD COLUMN source_file_url TEXT;
        END IF;

        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'surveys' AND column_name = 'source_file_name') THEN
            ALTER TABLE surveys ADD COLUMN source_file_name VARCHAR(255);
        END IF;

        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'surveys' AND column_name = 'created_by') THEN
            ALTER TABLE surveys ADD COLUMN created_by UUID;
        END IF;

        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'surveys' AND column_name = 'updated_at') THEN
            ALTER TABLE surveys ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        END IF;

        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'surveys' AND column_name = 'published_at') THEN
            ALTER TABLE surveys ADD COLUMN published_at TIMESTAMP WITH TIME ZONE;
        END IF;

        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'surveys' AND column_name = 'archived_at') THEN
            ALTER TABLE surveys ADD COLUMN archived_at TIMESTAMP WITH TIME ZONE;
        END IF;

        -- Asegurar constraints
        BEGIN
            ALTER TABLE surveys ADD CONSTRAINT unique_survey_code UNIQUE (code);
        EXCEPTION WHEN others THEN 
            -- Ya existe o hay duplicados que impiden crearlo
        END;
    END IF;
END $$;

-- 2. Tabla de Preguntas (survey_questions)
CREATE TABLE IF NOT EXISTS survey_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID REFERENCES surveys(id) ON DELETE CASCADE,
    question_number INTEGER NOT NULL,
    question_code VARCHAR(50),
    domain VARCHAR(100) NOT NULL,
    construct VARCHAR(200),
    question_text TEXT NOT NULL,
    question_type VARCHAR(10) NOT NULL, -- 'RP', 'FO', 'MIXED'
    weight DECIMAL(4,3) DEFAULT 1.0,
    severity DECIMAL(4,3) DEFAULT 1.0,
    personal_weight DECIMAL(4,3) DEFAULT 0,
    org_weight DECIMAL(4,3) DEFAULT 0,
    response_type VARCHAR(20) DEFAULT 'scale',
    response_config JSONB DEFAULT '{}'::jsonb,
    is_required BOOLEAN DEFAULT true,
    section VARCHAR(100),
    display_order INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabla de Asignación a Empresas (company_surveys)
CREATE TABLE IF NOT EXISTS company_surveys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    survey_id UUID REFERENCES surveys(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    is_mandatory BOOLEAN DEFAULT false,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    frequency VARCHAR(20) DEFAULT 'once', -- 'once', 'monthly', 'quarterly', 'yearly'
    assigned_by UUID REFERENCES auth.users(id),
    custom_config JSONB DEFAULT '{}'::jsonb,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(company_id, survey_id)
);

-- 4. Modificar tabla results (si existe) para vincular con encuesta específica
-- Primero verificamos si las columnas existen antes de intentar agregarlas
DO $$ 
BEGIN 
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'results') THEN
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'results' AND column_name = 'survey_id') THEN
            ALTER TABLE results ADD COLUMN survey_id UUID REFERENCES surveys(id);
        END IF;
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'results' AND column_name = 'survey_version') THEN
            ALTER TABLE results ADD COLUMN survey_version VARCHAR(20);
        END IF;
    END IF;
END $$;

-- 5. Tabla de Respuestas Individuales (survey_responses)
CREATE TABLE IF NOT EXISTS survey_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    result_id UUID REFERENCES results(id) ON DELETE CASCADE,
    question_id UUID REFERENCES survey_questions(id),
    response_value DECIMAL(4,2),
    response_text TEXT,
    response_data JSONB DEFAULT '{}'::jsonb,
    answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(result_id, question_id)
);

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_surveys_code ON surveys(code);
CREATE INDEX IF NOT EXISTS idx_surveys_status ON surveys(status);
CREATE INDEX IF NOT EXISTS idx_survey_questions_survey ON survey_questions(survey_id);
CREATE INDEX IF NOT EXISTS idx_company_surveys_company ON company_surveys(company_id);
CREATE INDEX IF NOT EXISTS idx_results_survey ON results(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_result ON survey_responses(result_id);

-- RLS (Row Level Security) - Básicos para empezar
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura (ejemplo: autenticados pueden leer)
DO $$ 
BEGIN 
    DROP POLICY IF EXISTS "Enable read access for authenticated users" ON surveys;
    CREATE POLICY "Enable read access for authenticated users" ON surveys FOR SELECT TO authenticated USING (true);

    DROP POLICY IF EXISTS "Enable read access for authenticated users" ON survey_questions;
    CREATE POLICY "Enable read access for authenticated users" ON survey_questions FOR SELECT TO authenticated USING (true);

    DROP POLICY IF EXISTS "Enable read access for authenticated users" ON company_surveys;
    CREATE POLICY "Enable read access for authenticated users" ON company_surveys FOR SELECT TO authenticated USING (true);

    DROP POLICY IF EXISTS "Enable read access for authenticated users" ON survey_responses;
    CREATE POLICY "Enable read access for authenticated users" ON survey_responses FOR SELECT TO authenticated USING (true);
END $$;
