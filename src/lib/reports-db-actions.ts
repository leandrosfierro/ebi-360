'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { Report } from './surveys/types';

export async function getReports(companyId: string, evaluationId?: string) {
    const supabase = await createClient();
    let query = supabase
        .from('reports')
        .select(`
            *,
            area:areas(name),
            evaluation:company_surveys(name)
        `)
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

    if (evaluationId) {
        query = query.eq('evaluation_id', evaluationId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data;
}

export async function saveReport(data: Partial<Report>) {
    const supabase = await createClient();
    const { data: report, error } = await supabase
        .from('reports')
        .insert(data)
        .select()
        .single();

    if (error) throw error;
    revalidatePath('/admin/company/reports');
    return report;
}

export async function deleteReport(id: string) {
    const supabase = await createClient();
    const { error } = await supabase
        .from('reports')
        .delete()
        .eq('id', id);

    if (error) throw error;
    revalidatePath('/admin/company/reports');
}
