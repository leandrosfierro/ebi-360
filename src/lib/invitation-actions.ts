"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { resend } from "@/lib/resend";
import { logEmail } from "@/lib/email-actions";

export async function getCompanyInvitationTemplate() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "No autenticado" };

    const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .maybeSingle();

    if (!profile?.company_id) return { error: "Sin empresa asignada" };

    // Try to find company specific template
    const { data: customTemplate } = await supabase
        .from('email_templates')
        .select('*')
        .eq('type', 'employee_invitation')
        .eq('company_id', profile.company_id)
        .maybeSingle();

    if (customTemplate) return { data: customTemplate };

    // Fallback to global template
    const { data: globalTemplate } = await supabase
        .from('email_templates')
        .select('*')
        .eq('type', 'employee_invitation')
        .is('company_id', null)
        .maybeSingle();

    return { data: globalTemplate };
}

export async function updateCompanyInvitationTemplate(subject: string, bodyHtml: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "No autenticado" };

    const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .maybeSingle();

    if (!profile?.company_id) return { error: "Sin empresa asignada" };

    const supabaseAdmin = createAdminClient();

    // Check if company template exists
    const { data: existing } = await supabaseAdmin
        .from('email_templates')
        .select('id')
        .eq('type', 'employee_invitation')
        .eq('company_id', profile.company_id)
        .maybeSingle();

    if (existing) {
        const { error } = await supabaseAdmin
            .from('email_templates')
            .update({
                subject,
                body_html: bodyHtml,
                updated_at: new Date().toISOString(),
                updated_by: user.id
            })
            .eq('id', existing.id);

        if (error) return { error: error.message };
    } else {
        const { error } = await supabaseAdmin
            .from('email_templates')
            .insert({
                type: 'employee_invitation',
                name: 'Invitación a Colaborador',
                company_id: profile.company_id,
                subject,
                body_html: bodyHtml,
                updated_by: user.id
            });

        if (error) return { error: error.message };
    }

    revalidatePath('/admin/company/emails');
    return { success: true };
}

export async function sendManualInvitations(employeeIds: string[]) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "No autenticado" };

    const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .maybeSingle();

    if (!profile?.company_id) return { error: "Sin empresa asignada" };

    // Get company details for placeholders
    const { data: company } = await supabase
        .from('companies')
        .select('name, logo_url')
        .eq('id', profile.company_id)
        .maybeSingle();

    // Get template
    const { data: templateResponse } = await getCompanyInvitationTemplate();
    const template = templateResponse;

    if (!template) return { error: "No se encontró la plantilla de invitación" };

    const supabaseAdmin = createAdminClient();
    const results = { sent: 0, failed: 0, errors: [] as string[] };

    for (const id of employeeIds) {
        try {
            const { data: employee } = await supabaseAdmin
                .from('profiles')
                .select('email, full_name')
                .eq('id', id)
                .eq('company_id', profile.company_id)
                .single();

            if (!employee) continue;

            const loginLink = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/login`;

            let htmlContent = template.body_html || "";
            htmlContent = htmlContent
                .replace(/{{full_name}}/g, employee.full_name || "")
                .replace(/{{company_name}}/g, company?.name || "")
                .replace(/{{logo_url}}/g, company?.logo_url || "")
                .replace(/{{login_link}}/g, loginLink);

            if (process.env.RESEND_API_KEY) {
                const { error: emailError } = await resend.emails.send({
                    from: 'EBI 360 <onboarding@resend.dev>',
                    to: employee.email,
                    subject: template.subject || "Invitación a EBI 360",
                    html: htmlContent
                });

                if (emailError) {
                    results.failed++;
                    results.errors.push(`${employee.email}: ${emailError.message}`);
                    await logEmail(employee.email, 'employee_invitation', 'failed', emailError.message, { employeeId: id });
                } else {
                    results.sent++;
                    await logEmail(employee.email, 'employee_invitation', 'sent', undefined, { employeeId: id });

                    // Update status to invited
                    await supabaseAdmin
                        .from('profiles')
                        .update({ admin_status: 'invited' })
                        .eq('id', id);
                }
            } else {
                results.failed++;
                results.errors.push(`${employee.email}: Error de configuración del servidor (Email)`);
            }
        } catch (err: any) {
            results.failed++;
            results.errors.push(`Error procesando ID ${id}: ${err.message}`);
        }
    }

    revalidatePath('/admin/company/employees');
    return { success: true, ...results };
}
