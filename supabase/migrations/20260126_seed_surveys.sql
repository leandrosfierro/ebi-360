-- 🗺️ Seed: Base EBI 360 Survey
-- Fecha: 26 de enero de 2026

-- 1. Insertar Encuesta Base
INSERT INTO public.surveys (name, description, slug, active, calculation_algorithm)
VALUES (
    'Diagnóstico EBI 360°',
    'Evaluación integral de bienestar personal y organizacional.',
    'ebi-360-base',
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
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name, 
    description = EXCLUDED.description, 
    calculation_algorithm = EXCLUDED.calculation_algorithm;

-- 2. Obtener el ID de la encuesta insertada
DO $$
DECLARE
    v_survey_id uuid;
BEGIN
    SELECT id INTO v_survey_id FROM public.surveys WHERE slug = 'ebi-360-base';

    -- 3. Limpiar preguntas previas para esta encuesta
    DELETE FROM public.survey_questions WHERE survey_id = v_survey_id;

    -- 4. Insertar preguntas
    INSERT INTO public.survey_questions (survey_id, question_number, domain, question_text, weight, severity)
    VALUES 
        (v_survey_id, 0, 'Físico', '¿Dormís lo suficiente como para sentirte descansado/a la mayoría de los días?', 1, 1),
        (v_survey_id, 1, 'Físico', '¿Tu jornada laboral permite mantener horarios regulares de descanso?', 1, 1),
        (v_survey_id, 2, 'Físico', '¿Te tomás pequeñas pausas o te movés unos minutos durante tu jornada?', 1, 1),
        (v_survey_id, 3, 'Físico', '¿El ritmo de trabajo permite hacer pausas breves cuando las necesitás?', 1, 1),
        (v_survey_id, 4, 'Nutricional', '¿Mantenés horarios mínimos para comer sin saltearte comidas?', 1, 1),
        (v_survey_id, 5, 'Nutricional', '¿Podés comer sin apuros durante tu jornada laboral?', 1, 1),
        (v_survey_id, 6, 'Emocional', '¿Podés manejar el estrés diario sin sentirte desbordado/a?', 1, 1),
        (v_survey_id, 7, 'Emocional', '¿Las exigencias del trabajo mantienen tu nivel de estrés en algo manejable?', 1, 1),
        (v_survey_id, 8, 'Emocional', '¿Lográs regular tus emociones en situaciones tensas?', 1, 1),
        (v_survey_id, 9, 'Emocional', '¿El ambiente laboral favorece un clima emocional saludable?', 1, 1),
        (v_survey_id, 10, 'Emocional', '¿Disfrutás al menos una parte de tu trabajo en el día a día?', 1, 1),
        (v_survey_id, 11, 'Emocional', '¿El entorno laboral favorece experiencias positivas durante la jornada?', 1, 1),
        (v_survey_id, 12, 'Social', '¿Te involucrás activamente para mantener relaciones positivas con tu equipo?', 1, 1),
        (v_survey_id, 13, 'Social', '¿Te sentís incluido/a y bien tratado/a por tu equipo?', 1, 1),
        (v_survey_id, 14, 'Social', '¿Pedís ayuda cuando realmente la necesitás?', 1, 1),
        (v_survey_id, 15, 'Social', '¿Tus compañeros suelen brindarte apoyo cuando lo necesitás?', 1, 1),
        (v_survey_id, 16, 'Familiar', '¿Lográs organizar tu vida personal sin que se vea afectada constantemente por el trabajo?', 1, 1),
        (v_survey_id, 17, 'Familiar', '¿La empresa respeta tus horarios y límites personales fuera del trabajo?', 1, 1),
        (v_survey_id, 18, 'Familiar', '¿Sentís apoyo de tu entorno para cumplir tus responsabilidades laborales?', 1, 1),
        (v_survey_id, 19, 'Familiar', '¿La empresa comprende y acompaña situaciones personales cuando es necesario?', 1, 1),
        (v_survey_id, 20, 'Económico', '¿Sentís tranquilidad en cómo manejás tus finanzas personales?', 1, 1),
        (v_survey_id, 21, 'Económico', '¿La estabilidad de tu ingreso te permite sentir tranquilidad mes a mes?', 1, 1),
        (v_survey_id, 22, 'Económico', '¿Tenés tus finanzas personales organizadas de manera clara?', 1, 1),
        (v_survey_id, 23, 'Económico', '¿Recibís tu información salarial de forma clara y confiable?', 1, 1);
END $$;
