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

    // 1. Generate AI Feedback
    const aiFeedback = await generateAiFeedback({
        scores: data.scores,
        average: averageScore,
        minDomain,
        maxDomain,
        note: data.note
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
}) {
    if (!process.env.GEMINI_API_KEY) {
        return {
            summary: "Hoy registraste tu rueda. Elegí una prioridad y hacé un paso chico. Podés volver a intentar generar el feedback más tarde.",
            priorities: ["Enfocarte en lo que hoy necesita más atención"],
            actions: []
        };
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
            Sos un coach de bienestar experto de la plataforma Bs360. 
            El usuario realizó un check-in de bienestar con los siguientes puntajes (1-10):
            ${JSON.stringify(input.scores)}
            Promedio General: ${input.average.toFixed(1)}
            Punto más bajo (Prioridad): ${input.minDomain}
            Punto más alto (Fortaleza): ${input.maxDomain}
            Nota del usuario: ${input.note || "Ninguna"}

            Generá un feedback cálido, cercano y accionable en español (Argentina), usando "vos".
            No menciones que sos una IA. No seas dramático con puntajes bajos.
            
            Retorná EXCLUSIVAMENTE un JSON con este esquema:
            {
                "summary": "texto corto 3-5 líneas",
                "priorities": ["bullet 1", "bullet 2"],
                "actions": [
                    {
                        "domain": "emocional|fisico|nutricional|social|familiar|financiero",
                        "score": 1-10,
                        "message": "1 frase de apoyo contextual",
                        "microActions": ["acción 1 (5-10 min)", "acción 2 (10-20 min)"]
                    }
                ],
                "celebrations": ["refuerzo positivo sobre fortalezas (1-2 bullets)"],
                "nextCheckIn": "sugerencia breve para el próximo check-in"
            }

            Reglas:
            - Si el score es <=4, sugerí acciones ultra simples (5-10 min).
            - Si el score es 5-7, sugerí mantenimiento y mejora.
            - Si el score es >=8, sugerí sostén y prevención.
            - Evitá diagnósticos médicos.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean up markdown if present
        const jsonStr = text.replace(/```json/g, "").replace(/```/g, "").trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("AI Generation Error:", error);
        return {
            summary: "Hoy registraste tu rueda. Elegí una prioridad y hacé un paso chico.",
            priorities: ["Enfocarte en lo que hoy necesita más atención"],
            actions: []
        };
    }
}
