export type QuestionType = "RP" | "FO";

export interface Question {
    id: number;
    domain: string;
    construct: string;
    type: QuestionType;
    text: string;
    weight: number;
    severity: number;
    personal_weight: number;
    org_weight: number;
}

export const questions: Question[] = [
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
];

export const domains = Array.from(new Set(questions.map((q) => q.domain)));

export interface Answer {
    questionId: number;
    value: number; // 1-5
}

export function calculateScore(answer: Answer, question: Question) {
    // Score_pregunta = (Respuesta/5) * PD_constructo * SR_constructo
    // Note: The Excel formula might be slightly different, but this is what was extracted.
    // Actually, standardizing to 0-1 or 0-100 is usually better, but let's stick to the raw calculation first.
    // If the max score is when Answer=5, then MaxScore = 1 * Weight * Severity.

    const rawScore = (answer.value / 5) * question.weight * question.severity;
    return rawScore;
}
