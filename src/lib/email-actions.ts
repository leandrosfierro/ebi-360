"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type EmailTemplate = {
    id: string;
    type: string;
    name: string;
    subject: string;
    body_html: string;
    updated_at: string;
};

export type EmailLog = {
    id: string;
    to_email: string;
    template_type: string;
    status: 'sent' | 'failed';
    error_message?: string;
    metadata?: any;
    sent_at: string;
};

export async function getEmailTemplates() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Unauthorized" };

    // Check if super admin
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'super_admin') {
        return { error: "Unauthorized: Super Admin only" };
    }

    const supabaseAdmin = createAdminClient();
    const { data, error } = await supabaseAdmin
        .from('email_templates')
        .select('*')
        .order('name');

    if (error) {
        console.error("Error fetching templates:", error);
        return { error: error.message };
    }

    return { data: data as EmailTemplate[] };
}

export async function updateEmailTemplate(id: string, subject: string, bodyHtml: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Unauthorized" };

    const { error } = await supabase
        .from('email_templates')
        .update({
            subject,
            body_html: bodyHtml,
            updated_at: new Date().toISOString(),
            updated_by: user.id
        })
        .eq('id', id);

    if (error) {
        console.error("Error updating template:", error);
        return { error: error.message };
    }

    revalidatePath('/admin/super/emails');
    return { success: true };
}

export async function getEmailLogs(limit = 50) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Unauthorized" };

    const supabaseAdmin = createAdminClient();
    const { data, error } = await supabaseAdmin
        .from('email_logs')
        .select('*')
        .order('sent_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error("Error fetching logs:", error);
        return { error: error.message };
    }

    return { data: data as EmailLog[] };
}

// Helper to log emails (to be called from server actions)
export async function logEmail(
    to: string,
    type: string,
    status: 'sent' | 'failed',
    errorMsg?: string,
    metadata?: any
) {
    const supabase = await createClient();
    // Use service role if needed? No, user action should log user ID. 
    // But logs table has RLS, insert policy allows true.

    // We get current user if possible
    const { data: { user } } = await supabase.auth.getUser();

    await supabase.from('email_logs').insert({
        to_email: to,
        template_type: type,
        status,
        error_message: errorMsg,
        metadata,
        sent_by: user?.id
    });
}
