'use server';

import { createClient, createAdminClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { SurveyImportData, SurveyStatus } from './types';

export async function saveSurvey(data: SurveyImportData) {
    const supabase = await createClient();

    // 1. Insert Metadata
    const { data: survey, error: surveyError } = await supabase
        .from('surveys')
        .insert({
            code: data.metadata.code,
            name: data.metadata.name,
            description: data.metadata.description,
            survey_type: data.metadata.survey_type,
            country_code: data.metadata.country_code,
            regulation_name: data.metadata.regulation_name,
            version: data.metadata.version,
            is_base: data.metadata.is_base,
            is_mandatory: data.metadata.is_mandatory,
            calculation_algorithm: data.algorithm,
            status: 'draft' // Always start as draft
        })
        .select()
        .single();

    if (surveyError) throw surveyError;

    // 2. Insert Questions
    const questionsToInsert = data.questions.map(q => ({
        survey_id: survey.id,
        question_number: q.question_number,
        domain: q.domain,
        construct: q.construct,
        question_type: q.question_type,
        question_text: q.question_text,
        weight: q.weight,
        severity: q.severity,
        personal_weight: q.personal_weight,
        org_weight: q.org_weight,
        display_order: q.question_number
    }));

    const { error: questionsError } = await supabase
        .from('survey_questions')
        .insert(questionsToInsert);

    if (questionsError) throw questionsError;

    return survey;
}

export async function getSurveys(filters: { status?: SurveyStatus, type?: string } = {}) {
    const supabase = await createClient();
    let query = supabase.from('surveys').select('*').order('created_at', { ascending: false });

    if (filters.status) query = query.eq('status', filters.status);
    if (filters.type) query = query.eq('survey_type', filters.type);

    const { data, error } = await query;
    if (error) throw error;
    return data;
}

export async function updateSurveyStatus(id: string, status: SurveyStatus) {
    const supabase = await createClient();
    const { error } = await supabase
        .from('surveys')
        .update({ status, published_at: status === 'active' ? new Date().toISOString() : null })
        .eq('id', id);

    if (error) throw error;
}

export async function deleteSurvey(id: string) {
    const supabase = await createClient();
    const { error } = await supabase
        .from('surveys')
        .delete()
        .eq('id', id);

    if (error) throw error;
}

export async function assignSurveyToCompany(companyId: string, surveyId: string) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return { error: 'No autenticado' };

        // Use Admin Client for role check to bypass RLS recursion
        const supabaseAdmin = createAdminClient();
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profileError || profile?.role !== 'super_admin') {
            console.error("Access denied in assignSurveyToCompany:", profileError || "Not a super_admin");
            return { error: '[v2] Error al asignar: Permisos insuficientes (Super Admin requerido)' };
        }

        // 2. Perform assignment using Admin Client to bypass RLS
        if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
            console.error('SUPABASE_SERVICE_ROLE_KEY is missing');
            return { error: 'Error de configuración del servidor' };
        }

        const adminSupabase = createAdminClient();
        const { error: insertError } = await adminSupabase
            .from('company_surveys')
            .insert({
                company_id: companyId,
                survey_id: surveyId,
                is_active: true,
                is_mandatory: true,
                assigned_by: user.id
            });

        if (insertError) {
            console.error('Insert error details:', insertError);
            return { error: `Error de base de datos: ${insertError.message}` };
        }

        revalidatePath('/admin/super/companies');
        return { success: true };
    } catch (e: any) {
        console.error('Critical internal error during assignment:', e);
        return { error: `Error interno: ${e.message || 'Desconocido'}` };
    }
}

export async function removeSurveyFromCompany(assignmentId: string) {
    try {
        // 1. Verify Super Admin status
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return { error: 'No autenticado' };

        const supabaseAdmin = createAdminClient();
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profileError || profile?.role !== 'super_admin') {
            return { error: 'Permisos insuficientes' };
        }

        // 2. Perform removal using Admin Client
        const adminSupabase = createAdminClient();
        const { error: deleteError } = await adminSupabase
            .from('company_surveys')
            .delete()
            .eq('id', assignmentId);

        if (deleteError) return { error: deleteError.message };

        revalidatePath('/admin/super/companies');
        return { success: true };
    } catch (e: any) {
        return { error: e.message || 'Error interno al desvincular' };
    }
}

export async function closeEvaluation(evaluationId: string) {
    try {
        const supabase = await createClient();

        // 1. Update status to closed
        const { error: updateError } = await supabase
            .from('company_surveys')
            .update({
                status: 'closed',
                end_date: new Date().toISOString()
            })
            .eq('id', evaluationId);

        if (updateError) throw updateError;

        // 2. Here we would trigger report generation and AI persistence.
        // For now, we'll mark it as closed.

        revalidatePath('/admin/company');
        return { success: true };
    } catch (error: any) {
        console.error('Error closing evaluation:', error);
        return { error: error.message };
    }
}
