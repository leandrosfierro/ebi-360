-- 🗺️ REVISED Seed: Base EBI 360 Survey
-- Fecha: 26 de enero de 2026

-- 1. Insertar Encuesta Base
-- Usamos 'code' en lugar de 'slug' para coincidir con el esquema real
INSERT INTO public.surveys (code, name, description, survey_type, status, is_base, calculation_algorithm)
VALUES (
    'ebi-360-base',
    'Diagnóstico EBI 360°',
    'Evaluación integral de bienestar personal y organizacional.',
    'base',
    'active',
    true,
    '{
        "domains": [
            {"name": "Físico", "questions": [0, 1, 2, 3], "weight": 1},
            {"name": "Nutricional", "questions": [4, 5], "weight": 1},
            {"name": "Emocional", "questions": [6, 7, 8, 9, 10, 11], "weight": 1},
            {"name": "Social", "questions": [12, 13, 14, 15], "weight": 1},
            {"name": "Familiar", "questions": [16, 17, 18, 19], "weight": 1},
            {"name": "Económico", "questions": [20, 21, 22, 23], "weight": 1}
        ]
    }'::jsonb
)
ON CONFLICT (code) DO UPDATE 
SET name = EXCLUDED.name, 
    description = EXCLUDED.description, 
    status = EXCLUDED.status,
    calculation_algorithm = EXCLUDED.calculation_algorithm;

-- 2. Insertar Preguntas (incluyendo question_type 'RP'/'FO' requerido)
DO $$
DECLARE
    v_survey_id uuid;
BEGIN
    SELECT id INTO v_survey_id FROM public.surveys WHERE code = 'ebi-360-base';

    -- Limpiar preguntas previas
    DELETE FROM public.survey_questions WHERE survey_id = v_survey_id;

    -- Insertar 24 preguntas base
    INSERT INTO public.survey_questions (survey_id, question_number, domain, question_text, question_type, weight, severity)
    VALUES 
        (v_survey_id, 0, 'Físico', '¿Dormís lo suficiente como para sentirte descansado/a la mayoría de los días?', 'RP', 1, 1),
        (v_survey_id, 1, 'Físico', '¿Tu jornada laboral permite mantener horarios regulares de descanso?', 'FO', 1, 1),
        (v_survey_id, 2, 'Físico', '¿Te tomás pequeñas pausas o te movés unos minutos durante tu jornada?', 'RP', 1, 1),
        (v_survey_id, 3, 'Físico', '¿El ritmo de trabajo permite hacer pausas breves cuando las necesitás?', 'FO', 1, 1),
        (v_survey_id, 4, 'Nutricional', '¿Mantenés horarios mínimos para comer sin saltearte comidas?', 'RP', 1, 1),
        (v_survey_id, 5, 'Nutricional', '¿Podés comer sin apuros durante tu jornada laboral?', 'FO', 1, 1),
        (v_survey_id, 6, 'Emocional', '¿Podés manejar el estrés diario sin sentirte desbordado/a?', 'RP', 1, 1),
        (v_survey_id, 7, 'Emocional', '¿Las exigencias del trabajo mantienen tu nivel de estrés en algo manejable?', 'FO', 1, 1),
        (v_survey_id, 8, 'Emocional', '¿Lográs regular tus emociones en situaciones tensas?', 'RP', 1, 1),
        (v_survey_id, 9, 'Emocional', '¿El ambiente laboral favorece un clima emocional saludable?', 'FO', 1, 1),
        (v_survey_id, 10, 'Emocional', '¿Disfrutás al menos una parte de tu trabajo en el día a día?', 'RP', 1, 1),
        (v_survey_id, 11, 'Emocional', '¿El entorno laboral favorece experiencias positivas durante la jornada?', 'FO', 1, 1),
        (v_survey_id, 12, 'Social', '¿Te involucrás activamente para mantener relaciones positivas con tu equipo?', 'RP', 1, 1),
        (v_survey_id, 13, 'Social', '¿Te sentís incluido/a y bien tratado/a por tu equipo?', 'FO', 1, 1),
        (v_survey_id, 14, 'Social', '¿Pedís ayuda cuando realmente la necesitás?', 'RP', 1, 1),
        (v_survey_id, 15, 'Social', '¿Tus compañeros suelen brindarte apoyo cuando lo necesitás?', 'FO', 1, 1),
        (v_survey_id, 16, 'Familiar', '¿Lográs organizar tu vida personal sin que se vea afectada constantemente por el trabajo?', 'RP', 1, 1),
        (v_survey_id, 17, 'Familiar', '¿La empresa respeta tus horarios y límites personales fuera del trabajo?', 'FO', 1, 1),
        (v_survey_id, 18, 'Familiar', '¿Sentís apoyo de tu entorno para cumplir tus responsabilidades laborales?', 'RP', 1, 1),
        (v_survey_id, 19, 'Familiar', '¿La empresa comprende y acompaña situaciones personales cuando es necesario?', 'FO', 1, 1),
        (v_survey_id, 20, 'Económico', '¿Sentís tranquilidad en cómo manejás tus finanzas personales?', 'RP', 1, 1),
        (v_survey_id, 21, 'Económico', '¿La estabilidad de tu ingreso te permite sentir tranquilidad mes a mes?', 'FO', 1, 1),
        (v_survey_id, 22, 'Económico', '¿Tenés tus finanzas personales organizadas de manera clara?', 'RP', 1, 1),
        (v_survey_id, 23, 'Económico', '¿Recibís tu información salarial de forma clara y confiable?', 'FO', 1, 1);
END $$;
