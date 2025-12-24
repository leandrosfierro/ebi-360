import { createClient } from '@/lib/supabase/client';
import { SurveyImportData, SurveyStatus } from './types';

export async function saveSurvey(data: SurveyImportData) {
    const supabase = createClient();

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
    const supabase = createClient();
    let query = supabase.from('surveys').select('*').order('created_at', { ascending: false });

    if (filters.status) query = query.eq('status', filters.status);
    if (filters.type) query = query.eq('survey_type', filters.type);

    const { data, error } = await query;
    if (error) throw error;
    return data;
}

export async function updateSurveyStatus(id: string, status: SurveyStatus) {
    const supabase = createClient();
    const { error } = await supabase
        .from('surveys')
        .update({ status, published_at: status === 'active' ? new Date().toISOString() : null })
        .eq('id', id);

    if (error) throw error;
}

export async function deleteSurvey(id: string) {
    const supabase = createClient();
    const { error } = await supabase
        .from('surveys')
        .delete()
        .eq('id', id);

    if (error) throw error;
}
