"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export type WellbeingCheckIn = {
    id: string;
    user_id: string;
    created_at: string;
    scores: Record<string, number>;
    average_score: number;
    min_domain: string;
    min_score: number;
    max_domain: string;
    max_score: number;
    note?: string;
    ai_feedback?: any;
    metadata?: any;
};

export async function saveWellbeingCheckIn(data: {
    scores: Record<string, number>;
    note?: string;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "No autenticado" };

    const scoresValues = Object.values(data.scores);
    const averageScore = scoresValues.reduce((a, b) => a + b, 0) / scoresValues.length;

    // Find min/max
    let minScore = 11;
    let minDomain = "";
    let maxScore = -1;
    let maxDomain = "";

    // Priority for tie-breaking in minDomain: emocional, fisico, nutricional, social, familiar, financiero
    const minPriority = ['emocional', 'fisico', 'nutricional', 'social', 'familiar', 'financiero'];

    for (const domain of minPriority) {
        const score = data.scores[domain];
        if (score < minScore) {
            minScore = score;
            minDomain = domain;
        }
    }

    // Max priority: inverse
    const maxPriority = [...minPriority].reverse();
    for (const domain of maxPriority) {
        const score = data.scores[domain];
        if (score > maxScore) {
            maxScore = score;
            maxDomain = domain;
        }
    }

    // 1. Get history for context if available
    const { data: history } = await supabase
        .from('wellbeing_checkins')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

    // 2. Generate AI Feedback
    const aiFeedback = await generateAiFeedback({
        scores: data.scores,
        average: averageScore,
        minDomain,
        maxDomain,
        note: data.note,
        history: history || []
    });

    const supabaseAdmin = createAdminClient();

    // 2. Insert Check-In
    const { data: checkInData, error: insertError } = await supabaseAdmin
        .from('wellbeing_checkins')
        .insert({
            user_id: user.id,
            scores: data.scores,
            average_score: parseFloat(averageScore.toFixed(1)),
            min_domain: minDomain,
            min_score: minScore,
            max_domain: maxDomain,
            max_score: maxScore,
            note: data.note,
            ai_feedback: aiFeedback
        })
        .select()
        .single();

    if (insertError) {
        console.error("Error saving check-in:", insertError);
        return { error: insertError.message };
    }

    // 3. Update Profile (Streak & Last Checkin)
    const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('wheel_last_checkin_at, wheel_streak_count, wheel_badges')
        .eq('id', user.id)
        .single();

    let newStreak = 1;
    let newBadges = profile?.wheel_badges || [];

    if (profile?.wheel_last_checkin_at) {
        const lastDate = new Date(profile.wheel_last_checkin_at);
        const today = new Date();
        const diffTime = Math.abs(today.getTime() - lastDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            newStreak = (profile.wheel_streak_count || 0) + 1;
        } else if (diffDays === 0) {
            newStreak = profile.wheel_streak_count || 1;
        }
    }

    // Badge Logic
    const currentBadges = new Set(newBadges);
    if (!currentBadges.has('primer_checkin')) {
        currentBadges.add('primer_checkin');
    }

    // Equilibrium badge: all domains >= 7
    if (scoresValues.every(s => s >= 7) && !currentBadges.has('equilibrio')) {
        currentBadges.add('equilibrio');
    }

    // 7 day streak
    if (newStreak >= 7 && !currentBadges.has('racha_7')) {
        currentBadges.add('racha_7');
    }

    await supabaseAdmin
        .from('profiles')
        .update({
            wheel_last_checkin_at: new Date().toISOString(),
            wheel_streak_count: newStreak,
            wheel_badges: Array.from(currentBadges)
        })
        .eq('id', user.id);

    revalidatePath("/admin/wellbeing/history");
    return { success: true, data: checkInData };
}

export async function getWellbeingHistory(days: number = 30) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "No autenticado" };

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
        .from('wellbeing_checkins')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

    if (error) return { error: error.message };
    return { data: data as WellbeingCheckIn[] };
}

export async function getLatestWellbeingCheckIn() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "No autenticado" };

    const { data, error } = await supabase
        .from('wellbeing_checkins')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (error) return { error: error.message };
    return { data: data as WellbeingCheckIn | null };
}

async function generateAiFeedback(input: {
    scores: Record<string, number>;
    average: number;
    minDomain: string;
    maxDomain: string;
    note?: string;
    history?: WellbeingCheckIn[];
}) {
    if (!process.env.GEMINI_API_KEY) {
        return {
            summary: "Hoy registraste tu rueda. Elegí una prioridad y hacé un paso chico.",
            priorities: ["Enfocarte en lo que hoy necesita más atención"],
            actions: []
        };
    }

    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            generationConfig: {
                responseMimeType: "application/json",
            }
        });

        const historyContext = input.history && input.history.length >= 2
            ? `\nHistorial Reciente (Tendencias):\n${input.history.slice(0, 5).map(h => `- ${new Date(h.created_at).toLocaleDateString()}: Promedio ${h.average_score}`).join('\n')}`
            : "";

        const prompt = `
            Actuá como un Consorcio de Especialistas de Bienestar de Bs360 liderado por un Director de Salud Integral. 
            Tu equipo está compuesto por especialistas en dominios: Físico (Médico), Emocional (Psicólogo), Nutricional (Nutricionista), Financiero (Asesor), Familiar/Social (Especialista en Vínculos).

            Información actual del usuario (1-10):
            ${JSON.stringify(input.scores)}
            Promedio General: ${input.average.toFixed(1)}
            Dimensión con mayor necesidad: ${input.minDomain} (${input.scores[input.minDomain]}/10)
            Fortaleza actual: ${input.maxDomain} (${input.scores[input.maxDomain]}/10)
            ${input.note ? `Nota personal/contexto: "${input.note}"` : ""}
            ${historyContext}

            Tu tarea es generar un "Plan de Acción del Día" profesional, empático y técnico.
            REGLAS CRÍTICAS:
            1. NO menciones que sos una IA. Hablá como "Nuestro equipo".
            2. Usá español (Argentina), tuteo ("vos").
            3. Analizá el historial para detectar tendencias.
            4. Generá un plan con sustento técnico para CADA dominio evaluado, pero el especialista del dominio más bajo (${input.minDomain}) debe ser quien dé el consejo más detallado.

            Retorná EXCLUSIVAMENTE un JSON con este esquema exacto:
            {
                "summary": "Resumen ejecutivo del estado actual (3-4 líneas)",
                "trendAnalysis": "Nota sobre la evolución profesional (si hay historial)",
                "planTitle": "Título motivacional corto",
                "specializedActions": [
                  {
                    "domain": "nombre del dominio",
                    "role": "Título del Especialista",
                    "technicalObservation": "Análisis profesional breve",
                    "actionPlan": ["Paso concreto 1", "Paso concreto 2"],
                    "focus": "Mantenimiento|Mejora|Crisis"
                  }
                ],
                "dailyMantra": "Frase de enfoque corta"
            }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return JSON.parse(text);
    } catch (error) {
        console.error("AI Generation Error:", error);
        return {
            summary: "Hoy registraste tu rueda. El equipo de Bs360 sugiere enfocarte en tu bienestar general mientras estabilizamos el análisis detallado.",
            trendAnalysis: "Estamos recopilando más datos para tu análisis de tendencias.",
            planTitle: "Tu enfoque para hoy",
            specializedActions: [
                {
                    "domain": "Bienestar General",
                    "role": "Coordinador de Salud",
                    "technicalObservation": "Tu promedio es sólido. Seguí registrando para un análisis profundo.",
                    "actionPlan": ["Mantené la hidratación", "Hacé una pausa de 5 minutos"],
                    "focus": "Mantenimiento"
                }
            ],
            dailyMantra: "La constancia es la clave del bienestar."
        };
    }
}

export async function regenerateWellbeingPlan(checkInId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "No autenticado" };

    // 1. Get the check-in
    const { data: checkIn } = await supabase
        .from('wellbeing_checkins')
        .select('*')
        .eq('id', checkInId)
        .eq('user_id', user.id)
        .single();

    if (!checkIn) return { error: "Check-in no encontrado" };

    // 2. Get history
    const { data: history } = await supabase
        .from('wellbeing_checkins')
        .select('*')
        .eq('user_id', user.id)
        .lt('created_at', checkIn.created_at)
        .order('created_at', { ascending: false })
        .limit(10);

    // 3. Re-generate
    const aiFeedback = await generateAiFeedback({
        scores: checkIn.scores,
        average: checkIn.average_score,
        minDomain: checkIn.min_domain,
        maxDomain: checkIn.max_domain,
        note: checkIn.note,
        history: history || []
    });

    // 4. Update
    const supabaseAdmin = createAdminClient();
    const { error: updateError } = await supabaseAdmin
        .from('wellbeing_checkins')
        .update({ ai_feedback: aiFeedback })
        .eq('id', checkInId);

    if (updateError) return { error: updateError.message };

    revalidatePath("/wellbeing/plan");
    return { success: true, aiFeedback };
}
