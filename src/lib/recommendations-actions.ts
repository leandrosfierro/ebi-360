'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function getRecommendations(companyId: string, evaluationId?: string) {
    const supabase = await createClient();
    let query = supabase
        .from('recommendations')
        .select(`
            *,
            area:areas(name)
        `)
        .order('priority', { ascending: false });

    if (evaluationId) {
        query = query.eq('evaluation_id', evaluationId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
}

export async function saveRecommendation(data: any) {
    const supabase = await createClient();
    const { data: rec, error } = await supabase
        .from('recommendations')
        .upsert(data)
        .select()
        .single();

    if (error) throw error;
    revalidatePath('/admin/company/reports');
    return rec;
}

export async function generateCompanyRecommendations(evaluationId: string, companyId: string) {
    const supabase = await createClient();

    // 1. Fetch data for analysis
    const { data: results } = await supabase
        .from('results')
        .select('global_score, domain_scores, area_id')
        .eq('survey_id', evaluationId);

    if (!results || results.length === 0) {
        return { error: "No hay resultados suficientes para analizar." };
    }

    // 2. Prepare context for AI
    const averageScore = results.reduce((acc, r) => acc + Number(r.global_score), 0) / results.length;

    // Simplified context for now
    const context = {
        totalResponses: results.length,
        averageScore: averageScore.toFixed(2),
        // Aggregate domain scores would go here
    };

    if (!process.env.GEMINI_API_KEY) {
        return { error: "GEMINI_API_KEY no configurada." };
    }

    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            generationConfig: { responseMimeType: "application/json" }
        });

        const prompt = `
            Actuá como un Consultor Senior de Bienestar Corporativo de Bs360.
            Analizá los siguientes datos agregados de una evaluación de bienestar organizacional:
            ${JSON.stringify(context)}

            Generá 3 hallazgos clave y 3 recomendaciones accionables.
            Retorná un JSON con este formato:
            {
                "recommendations": [
                    {
                        "domain": "nombre del dominio (Físico, Emocional, etc)",
                        "finding_text": "Descripción del hallazgo basado en los datos",
                        "recommendation_text": "Sugerencia concreta de mejora",
                        "priority": "alta|media|baja",
                        "recommendation_type": "organizacional|equipo|individual"
                    }
                ]
            }
        `;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const aiData = JSON.parse(text);

        // 3. Save to database
        const inserts = aiData.recommendations.map((rec: any) => ({
            evaluation_id: evaluationId,
            company_id: companyId,
            ...rec,
            source: 'ai'
        }));

        const { error: insertError } = await supabase
            .from('recommendations')
            .insert(inserts);

        if (insertError) throw insertError;

        revalidatePath('/admin/company/reports');
        return { success: true };
    } catch (error: any) {
        console.error("Error generating AI recommendations:", error);
        return { error: error.message };
    }
}
