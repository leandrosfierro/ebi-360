'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { Area } from './surveys/types';

export async function getAreas(companyId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('areas')
        .select('*')
        .eq('company_id', companyId)
        .order('name');

    if (error) throw error;
    return data as Area[];
}

export async function createArea(companyId: string, name: string, description?: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('areas')
        .insert({
            company_id: companyId,
            name,
            description
        })
        .select()
        .single();

    if (error) throw error;
    revalidatePath('/admin/company/settings/areas');
    return data as Area;
}

export async function updateArea(id: string, name: string, description?: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('areas')
        .update({
            name,
            description,
            updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    revalidatePath('/admin/company/settings/areas');
    return data as Area;
}

export async function deleteArea(id: string) {
    const supabase = await createClient();
    const { error } = await supabase
        .from('areas')
        .delete()
        .eq('id', id);

    if (error) throw error;
    revalidatePath('/admin/company/settings/areas');
}

export async function assignAreaToUser(userId: string, areaId: string | null) {
    const supabase = await createClient();
    const { error } = await supabase
        .from('profiles')
        .update({ area_id: areaId })
        .eq('id', userId);

    if (error) throw error;
    revalidatePath('/admin/company/employees');
}
