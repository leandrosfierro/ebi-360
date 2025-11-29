// Achievement system utilities

export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    condition: (data: { diagnosticCount: number; globalScore: number; scores: Record<string, number> }) => boolean;
    unlocked?: boolean;
}

export const achievements: Achievement[] = [
    {
        id: "first_diagnostic",
        title: "Primer Paso",
        description: "Completaste tu primer diagnóstico",
        icon: "🎯",
        condition: (data) => data.diagnosticCount >= 1,
    },
    {
        id: "high_achiever",
        title: "Alto Rendimiento",
        description: "Obtuviste un puntaje global superior a 8",
        icon: "⭐",
        condition: (data) => data.globalScore >= 8,
    },
    {
        id: "balanced",
        title: "Equilibrado",
        description: "Todos tus dominios están por encima de 6",
        icon: "⚖️",
        condition: (data) => Object.values(data.scores).every(score => score >= 6),
    },
    {
        id: "physical_master",
        title: "Maestro Físico",
        description: "Puntaje perfecto en dominio Físico",
        icon: "💪",
        condition: (data) => data.scores["Físico"] >= 9.5,
    },
    {
        id: "emotional_guru",
        title: "Gurú Emocional",
        description: "Puntaje perfecto en dominio Emocional",
        icon: "❤️",
        condition: (data) => data.scores["Emocional"] >= 9.5,
    },
    {
        id: "social_butterfly",
        title: "Mariposa Social",
        description: "Puntaje perfecto en dominio Social",
        icon: "🦋",
        condition: (data) => data.scores["Social"] >= 9.5,
    },
];

export function checkAchievements(data: {
    diagnosticCount: number;
    globalScore: number;
    scores: Record<string, number>;
}): Achievement[] {
    return achievements.map(achievement => ({
        ...achievement,
        unlocked: achievement.condition(data),
    }));
}

// Domain-specific recommendations
export interface Recommendation {
    domain: string;
    scoreRange: [number, number];
    title: string;
    suggestions: string[];
}

export const recommendations: Recommendation[] = [
    {
        domain: "Físico",
        scoreRange: [0, 5],
        title: "Necesita atención urgente",
        suggestions: [
            "Consulta con un médico para un chequeo general",
            "Establece una rutina de ejercicio básica (20 min/día)",
            "Mejora tus hábitos de sueño (7-8 horas)",
        ],
    },
    {
        domain: "Físico",
        scoreRange: [5, 7],
        title: "En desarrollo",
        suggestions: [
            "Incrementa tu actividad física gradualmente",
            "Mantén un horario regular de sueño",
            "Considera actividades al aire libre",
        ],
    },
    {
        domain: "Físico",
        scoreRange: [7, 10],
        title: "¡Excelente!",
        suggestions: [
            "Mantén tu rutina actual",
            "Desafíate con nuevas actividades",
            "Comparte tus hábitos con otros",
        ],
    },
    {
        domain: "Nutricional",
        scoreRange: [0, 5],
        title: "Necesita atención urgente",
        suggestions: [
            "Consulta con un nutricionista",
            "Aumenta el consumo de frutas y verduras",
            "Reduce alimentos procesados",
        ],
    },
    {
        domain: "Nutricional",
        scoreRange: [5, 7],
        title: "En desarrollo",
        suggestions: [
            "Planifica tus comidas semanalmente",
            "Hidrátate adecuadamente (2L agua/día)",
            "Incorpora más variedad de alimentos",
        ],
    },
    {
        domain: "Nutricional",
        scoreRange: [7, 10],
        title: "¡Excelente!",
        suggestions: [
            "Mantén tus buenos hábitos",
            "Experimenta con recetas saludables",
            "Inspira a otros con tu alimentación",
        ],
    },
    {
        domain: "Emocional",
        scoreRange: [0, 5],
        title: "Necesita atención urgente",
        suggestions: [
            "Considera terapia profesional",
            "Practica mindfulness o meditación",
            "Habla con personas de confianza",
        ],
    },
    {
        domain: "Emocional",
        scoreRange: [5, 7],
        title: "En desarrollo",
        suggestions: [
            "Dedica tiempo a actividades que disfrutas",
            "Practica gratitud diariamente",
            "Establece límites saludables",
        ],
    },
    {
        domain: "Emocional",
        scoreRange: [7, 10],
        title: "¡Excelente!",
        suggestions: [
            "Continúa con tus prácticas de autocuidado",
            "Ayuda a otros con tu experiencia",
            "Explora nuevas formas de crecimiento personal",
        ],
    },
    {
        domain: "Social",
        scoreRange: [0, 5],
        title: "Necesita atención urgente",
        suggestions: [
            "Únete a grupos con intereses comunes",
            "Reconecta con amigos o familiares",
            "Considera actividades grupales",
        ],
    },
    {
        domain: "Social",
        scoreRange: [5, 7],
        title: "En desarrollo",
        suggestions: [
            "Organiza encuentros regulares",
            "Participa en eventos comunitarios",
            "Desarrolla nuevas amistades",
        ],
    },
    {
        domain: "Social",
        scoreRange: [7, 10],
        title: "¡Excelente!",
        suggestions: [
            "Mantén tus conexiones actuales",
            "Lidera iniciativas sociales",
            "Mentoriza a otros en habilidades sociales",
        ],
    },
    {
        domain: "Familiar",
        scoreRange: [0, 5],
        title: "Necesita atención urgente",
        suggestions: [
            "Busca terapia familiar si es necesario",
            "Establece comunicación regular",
            "Dedica tiempo de calidad a tu familia",
        ],
    },
    {
        domain: "Familiar",
        scoreRange: [5, 7],
        title: "En desarrollo",
        suggestions: [
            "Organiza actividades familiares",
            "Mejora la comunicación familiar",
            "Establece tradiciones familiares",
        ],
    },
    {
        domain: "Familiar",
        scoreRange: [7, 10],
        title: "¡Excelente!",
        suggestions: [
            "Mantén las tradiciones familiares",
            "Fortalece los lazos existentes",
            "Sé ejemplo para otros",
        ],
    },
    {
        domain: "Económico",
        scoreRange: [0, 5],
        title: "Necesita atención urgente",
        suggestions: [
            "Consulta con un asesor financiero",
            "Crea un presupuesto mensual",
            "Reduce gastos innecesarios",
        ],
    },
    {
        domain: "Económico",
        scoreRange: [5, 7],
        title: "En desarrollo",
        suggestions: [
            "Establece un fondo de emergencia",
            "Planifica tus gastos a largo plazo",
            "Busca fuentes de ingreso adicionales",
        ],
    },
    {
        domain: "Económico",
        scoreRange: [7, 10],
        title: "¡Excelente!",
        suggestions: [
            "Mantén tu disciplina financiera",
            "Considera inversiones",
            "Comparte tus conocimientos financieros",
        ],
    },
];

export function getRecommendations(domain: string, score: number): Recommendation | null {
    return recommendations.find(
        rec => rec.domain === domain && score >= rec.scoreRange[0] && score < rec.scoreRange[1]
    ) || null;
}
