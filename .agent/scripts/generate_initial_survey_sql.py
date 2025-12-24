import json

# Data extracted from src/lib/logic.ts
questions = [
    {
        "id": 0,
        "domain": "Físico",
        "construct": "Bienestar corporal básico",
        "type": "RP",
        "text": "¿Dormís lo suficiente como para sentirte descansado/a la mayoría de los días?",
        "weight": 0.6,
        "severity": 0.9,
        "personal_weight": 1,
        "org_weight": 0
    },
    {
        "id": 1,
        "domain": "Físico",
        "construct": "Bienestar corporal básico",
        "type": "FO",
        "text": "¿Tu jornada laboral permite mantener horarios regulares de descanso?",
        "weight": 0.6,
        "severity": 0.9,
        "personal_weight": 0,
        "org_weight": 1
    },
    {
        "id": 2,
        "domain": "Físico",
        "construct": "Cuidado físico diario",
        "type": "RP",
        "text": "¿Te tomás pequeñas pausas o te movés unos minutos durante tu jornada?",
        "weight": 0.4,
        "severity": 0.8,
        "personal_weight": 1,
        "org_weight": 0
    },
    {
        "id": 3,
        "domain": "Físico",
        "construct": "Cuidado físico diario",
        "type": "FO",
        "text": "¿El ritmo de trabajo permite hacer pausas breves cuando las necesitás?",
        "weight": 0.4,
        "severity": 0.8,
        "personal_weight": 0,
        "org_weight": 1
    },
    {
        "id": 4,
        "domain": "Nutricional",
        "construct": "Hábitos alimentarios básicos",
        "type": "RP",
        "text": "¿Mantenés horarios mínimos para comer sin saltearte comidas?",
        "weight": 1.0,
        "severity": 0.7,
        "personal_weight": 1,
        "org_weight": 0
    },
    {
        "id": 5,
        "domain": "Nutricional",
        "construct": "Hábitos alimentarios básicos",
        "type": "FO",
        "text": "¿Podés comer sin apuros durante tu jornada laboral?",
        "weight": 1.0,
        "severity": 0.7,
        "personal_weight": 0,
        "org_weight": 1
    },
    {
        "id": 6,
        "domain": "Emocional",
        "construct": "Tensión mental/emocional",
        "type": "RP",
        "text": "¿Podés manejar el estrés diario sin sentirte desbordado/a?",
        "weight": 0.4,
        "severity": 0.9,
        "personal_weight": 1,
        "org_weight": 0
    },
    {
        "id": 7,
        "domain": "Emocional",
        "construct": "Tensión mental/emocional",
        "type": "FO",
        "text": "¿Las exigencias del trabajo mantienen tu nivel de estrés en algo manejable?",
        "weight": 0.4,
        "severity": 0.9,
        "personal_weight": 0,
        "org_weight": 1
    },
    {
        "id": 8,
        "domain": "Emocional",
        "construct": "Manejo emocional",
        "type": "RP",
        "text": "¿Lográs regular tus emociones en situaciones tensas?",
        "weight": 0.35,
        "severity": 0.85,
        "personal_weight": 1,
        "org_weight": 0
    },
    {
        "id": 9,
        "domain": "Emocional",
        "construct": "Manejo emocional",
        "type": "FO",
        "text": "¿El ambiente laboral favorece un clima emocional saludable?",
        "weight": 0.35,
        "severity": 0.85,
        "personal_weight": 0,
        "org_weight": 1
    },
    {
        "id": 10,
        "domain": "Emocional",
        "construct": "Satisfacción emocional",
        "type": "RP",
        "text": "¿Disfrutás al menos una parte de tu trabajo en el día a día?",
        "weight": 0.25,
        "severity": 0.7,
        "personal_weight": 1,
        "org_weight": 0
    },
    {
        "id": 11,
        "domain": "Emocional",
        "construct": "Satisfacción emocional",
        "type": "FO",
        "text": "¿El entorno laboral favorece experiencias positivas durante la jornada?",
        "weight": 0.25,
        "severity": 0.7,
        "personal_weight": 0,
        "org_weight": 1
    },
    {
        "id": 12,
        "domain": "Social",
        "construct": "Vínculos sociales",
        "type": "RP",
        "text": "¿Te involucrás activamente para mantener relaciones positivas con tu equipo?",
        "weight": 0.55,
        "severity": 0.8,
        "personal_weight": 1,
        "org_weight": 0
    },
    {
        "id": 13,
        "domain": "Social",
        "construct": "Vínculos sociales",
        "type": "FO",
        "text": "¿Te sentís incluido/a y bien tratado/a por tu equipo?",
        "weight": 0.55,
        "severity": 0.8,
        "personal_weight": 0,
        "org_weight": 1
    },
    {
        "id": 14,
        "domain": "Social",
        "construct": "Intercambio humano",
        "type": "RP",
        "text": "¿Pedís ayuda cuando realmente la necesitás?",
        "weight": 0.45,
        "severity": 0.7,
        "personal_weight": 1,
        "org_weight": 0
    },
    {
        "id": 15,
        "domain": "Social",
        "construct": "Intercambio humano",
        "type": "FO",
        "text": "¿Tus compañeros suelen brindarte apoyo cuando lo necesitás?",
        "weight": 0.45,
        "severity": 0.7,
        "personal_weight": 0,
        "org_weight": 1
    },
    {
        "id": 16,
        "domain": "Familiar",
        "construct": "Armonía trabajo–vida",
        "type": "RP",
        "text": "¿Lográs organizar tu vida personal sin que se vea afectada constantemente por el trabajo?",
        "weight": 0.6,
        "severity": 0.85,
        "personal_weight": 1,
        "org_weight": 0
    },
    {
        "id": 17,
        "domain": "Familiar",
        "construct": "Armonía trabajo–vida",
        "type": "FO",
        "text": "¿La empresa respeta tus horarios y límites personales fuera del trabajo?",
        "weight": 0.6,
        "severity": 0.85,
        "personal_weight": 0,
        "org_weight": 1
    },
    {
        "id": 18,
        "domain": "Familiar",
        "construct": "Soporte del entorno",
        "type": "RP",
        "text": "¿Sentís apoyo de tu entorno para cumplir tus responsabilidades laborales?",
        "weight": 0.4,
        "severity": 0.7,
        "personal_weight": 1,
        "org_weight": 0
    },
    {
        "id": 19,
        "domain": "Familiar",
        "construct": "Soporte del entorno",
        "type": "FO",
        "text": "¿La empresa comprende y acompaña situaciones personales cuando es necesario?",
        "weight": 0.4,
        "severity": 0.7,
        "personal_weight": 0,
        "org_weight": 1
    },
    {
        "id": 20,
        "domain": "Económico",
        "construct": "Seguridad económica",
        "type": "RP",
        "text": "¿Sentís tranquilidad en cómo manejás tus finanzas personales?",
        "weight": 0.6,
        "severity": 0.85,
        "personal_weight": 1,
        "org_weight": 0
    },
    {
        "id": 21,
        "domain": "Económico",
        "construct": "Seguridad económica",
        "type": "FO",
        "text": "¿La estabilidad de tu ingreso te permite sentir tranquilidad mes a mes?",
        "weight": 0.6,
        "severity": 0.85,
        "personal_weight": 0,
        "org_weight": 1
    },
    {
        "id": 22,
        "domain": "Económico",
        "construct": "Gestión económica personal",
        "type": "RP",
        "text": "¿Tenés tus finanzas personales organizadas de manera clara?",
        "weight": 0.4,
        "severity": 0.8,
        "personal_weight": 1,
        "org_weight": 0
    },
    {
        "id": 23,
        "domain": "Económico",
        "construct": "Gestión económica personal",
        "type": "FO",
        "text": "¿Recibís tu información salarial de forma clara y confiable?",
        "weight": 0.4,
        "severity": 0.8,
        "personal_weight": 0,
        "org_weight": 1
    }
]

survey_code = "EBI360"
survey_name = "EBI 360 v2.0"
survey_version = "2.0"

scoring_config = {
    "scoring_method": "weighted_average",
    "domains": [
        {"name": "Físico", "weight": 1.0, "questions": [0, 1, 2, 3]},
        {"name": "Nutricional", "weight": 1.0, "questions": [4, 5]},
        {"name": "Emocional", "weight": 1.0, "questions": [6, 7, 8, 9, 10, 11]},
        {"name": "Social", "weight": 1.0, "questions": [12, 13, 14, 15]},
        {"name": "Familiar", "weight": 1.0, "questions": [16, 17, 18, 19]},
        {"name": "Económico", "weight": 1.0, "questions": [20, 21, 22, 23]}
    ],
    "thresholds": {
        "low": 0,
        "medium": 5,
        "high": 7,
        "excellent": 9
    }
}

sql = []
sql.append("-- 🛠️ Migración de Encuesta Base EBI 360")
sql.append("BEGIN;")
sql.append("\n-- 1. Insertar Encuesta")
sql.append(f"INSERT INTO surveys (code, name, description, survey_type, version, status, is_base, calculation_algorithm)")
sql.append(f"VALUES ('{survey_code}', '{survey_name}', 'Evaluación de Bienestar Integral 360', 'base', '{survey_version}', 'active', true, '{json.dumps(scoring_config)}');")

sql.append("\n-- 2. Obtener ID de la encuesta")
sql.append("DO $$")
sql.append("DECLARE")
sql.append("    v_survey_id UUID;")
sql.append("BEGIN")
sql.append(f"    SELECT id INTO v_survey_id FROM surveys WHERE code = '{survey_code}';")

sql.append("\n    -- 3. Insertar Preguntas")
for q in questions:
    q_sql = f"    INSERT INTO survey_questions (survey_id, question_number, domain, construct, question_type, question_text, weight, severity, personal_weight, org_weight, display_order)"
    q_sql += f" VALUES (v_survey_id, {q['id']}, '{q['domain']}', '{q['construct']}', '{q['type']}', '{q['text']}', {q['weight']}, {q['severity']}, {q['personal_weight']}, {q['org_weight']}, {q['id']});"
    sql.append(q_sql)

sql.append("END $$;")
sql.append("\nCOMMIT;")

with open("/Users/leandrofierro/Workspaces/ebi-360/.agent/migrations/seed_ebi360_survey.sql", "w") as f:
    f.write("\n".join(sql))

print("✅ Script de migración generado en .agent/migrations/seed_ebi360_survey.sql")
