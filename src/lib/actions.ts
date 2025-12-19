"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { resend } from "@/lib/resend";

export async function saveDiagnosticResult(
    globalScore: number,
    domainScores: Record<string, number>,
    answers: Record<string, number>
) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { error: "User not authenticated" };
    }

    try {
        // Check if profile exists, if not create it (fallback)
        const { data: profile } = await supabase
            .from("profiles")
            .select("id")
            .eq("id", user.id)
            .single();

        if (!profile) {
            await supabase.from("profiles").insert({
                id: user.id,
                email: user.email,
                full_name: user.user_metadata.full_name || user.email?.split("@")[0],
                role: "employee",
            });
        }

        // Insert result
        const { error } = await supabase.from("results").insert({
            user_id: user.id,
            global_score: globalScore,
            domain_scores: domainScores,
            answers: answers,
        });

        if (error) throw error;

        revalidatePath("/admin/company");
        return { success: true };
    } catch (error) {
        console.error("Error saving result:", error);
        return { error: "Failed to save result" };
    }
}

export async function createCompany(formData: FormData) {
    const supabase = await createClient();

    // Verify super admin role
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'super_admin') {
        return { error: "Unauthorized: Super Admin only" };
    }

    const name = formData.get("name") as string;
    const plan = formData.get("plan") as "basic" | "pro" | "enterprise";
    const active = formData.get("active") === "on";

    try {
        const { error } = await supabase.from("companies").insert({
            name,
            subscription_plan: plan,
            active,
            primary_color: "#7e22ce", // Default purple
        });

        if (error) throw error;


        revalidatePath("/admin/super/companies");
        return { success: true };
    } catch (error) {
        console.error("Error creating company:", error);
        return { error: "Failed to create company" };
    }
}

export async function bulkUploadUsers(users: Array<{ email: string; full_name: string; department?: string }>) {
    const supabase = await createClient();

    // Verify company admin role
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    const { data: profile } = await supabase
        .from('profiles')
        .select('role, company_id')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'company_admin' && profile?.role !== 'super_admin') {
        return { error: "Unauthorized: Admin only" };
    }

    const companyId = profile.company_id;
    if (!companyId) {
        return { error: "No company assigned to admin" };
    }

    const errors: string[] = [];
    let created = 0;

    for (const userData of users) {
        try {
            // Check if user already exists
            const { data: existingUser } = await supabase
                .from('profiles')
                .select('id')
                .eq('email', userData.email)
                .single();

            if (existingUser) {
                errors.push(`${userData.email}: Usuario ya existe`);
                continue;
            }

            // Send invitation email via Supabase Auth
            const { data: inviteData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(
                userData.email,
                {
                    data: {
                        full_name: userData.full_name,
                        company_id: companyId,
                        role: 'employee',
                    },
                    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
                }
            );

            if (inviteError) {
                // Fallback: Create profile manually if invite fails
                const { error: profileError } = await supabase.from('profiles').insert({
                    email: userData.email,
                    full_name: userData.full_name,
                    role: 'employee',
                    company_id: companyId,
                });

                if (profileError) {
                    errors.push(`${userData.email}: ${profileError.message}`);
                    continue;
                }
            }

            created++;
        } catch (error: any) {
            errors.push(`${userData.email}: ${error.message || 'Error desconocido'}`);
        }
    }

    revalidatePath("/admin/company/employees");

    return {
        success: true,
        created,
        errors
    };
}

export async function updateProfile(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "User not authenticated" };
    }

    const fullName = formData.get("fullName") as string;

    try {
        const { error } = await supabase
            .from("profiles")
            .update({ full_name: fullName })
            .eq("id", user.id);

        if (error) throw error;

        revalidatePath("/admin/super/settings");
        revalidatePath("/perfil");
        return { success: true };
    } catch (error) {
        console.error("Error updating profile:", error);
        return { error: "Failed to update profile" };
    }
}

export async function inviteCompanyAdmin(email: string, fullName: string, companyId: string) {
    const supabase = await createClient();

    // Verify super admin role
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    const { data: adminProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (adminProfile?.role !== 'super_admin') {
        return { error: "Unauthorized: Super Admin only" };
    }

    // Validate that SERVICE_ROLE_KEY is configured
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.error("SUPABASE_SERVICE_ROLE_KEY is not configured");
        return { error: "Server configuration error: Missing service role key. Please contact support." };
    }

    // Use Admin Client for privileged operations
    const supabaseAdmin = createAdminClient();

    try {
        // 1. Check if user already exists (using admin client to ensure visibility)
        const { data: existingUser, error: checkError } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .eq('email', email)
            .single();

        if (checkError && checkError.code !== 'PGRST116') {
            // PGRST116 is "not found" which is expected for new users
            console.error("Error checking existing user:", checkError);
            throw new Error(`Database error: ${checkError.message}`);
        }

        if (existingUser) {
            // Update existing user to be company admin
            const { error: updateError } = await supabaseAdmin
                .from('profiles')
                .update({
                    role: 'company_admin',
                    active_role: 'company_admin',
                    roles: ['company_admin'],
                    company_id: companyId
                })
                .eq('id', existingUser.id);

            if (updateError) {
                console.error("Error updating user:", updateError);
                throw new Error(`Failed to update user: ${updateError.message}`);
            }
        } else {
            // 2. Invite new user
            // 2.1 Generate Invite Link using Supabase (without sending email)
            const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
                type: 'invite',
                email: email,
                options: {
                    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
                    data: {
                        full_name: fullName,
                        company_id: companyId,
                        role: 'company_admin',
                        active_role: 'company_admin',
                        admin_status: 'invited',
                    }
                }
            });

            if (linkError) {
                console.error("Error generating link:", linkError);
                throw new Error("No se pudo generar el enlace de invitación");
            }

            const { user: newUser, properties } = linkData;
            const inviteLink = properties.action_link;

            // 2.2 Upsert profile (user is created by generateLink if not exists)
            const { error: profileError } = await supabaseAdmin
                .from('profiles')
                .upsert({
                    id: newUser.id,
                    email: email,
                    full_name: fullName,
                    role: 'company_admin',
                    active_role: 'company_admin',
                    roles: ['company_admin'],
                    company_id: companyId,
                    admin_status: 'invited',
                });

            if (profileError) {
                console.error("Error creating profile:", profileError);
                throw new Error(`Error al crear perfil: ${profileError.message}`);
            }

            // 3. Prepare Email Content
            // 3.1 Fetch template
            const { data: template } = await supabaseAdmin
                .from('email_templates')
                .select('*')
                .eq('type', 'invite_company_admin')
                .single();

            // Default fallback if no template found
            const defaultSubject = 'Invitación a Administrar Empresa en EBI 360';
            let subject = template?.subject || defaultSubject;
            let htmlContent = template?.body_html || `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #7e22ce;">Bienvenido a EBI 360</h1>
                    <p>Hola <strong>{{full_name}}</strong>,</p>
                    <p>Has sido invitado a unirte a EBI 360 para administrar tu empresa.</p>
                    <p>Para comenzar, por favor acepta la invitación haciendo clic en el siguiente botón:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="{{invite_link}}" style="background-color: #7e22ce; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                            Aceptar Invitación
                        </a>
                    </div>
                </div>
            `;

            // 3.2 Replace variables
            htmlContent = htmlContent
                .replace(/{{full_name}}/g, fullName)
                .replace(/{{invite_link}}/g, inviteLink);

            // 3.3 Send Email via Resend
            try {
                // If RESEND_API_KEY is not set, this will fail. We should catch it.
                if (!process.env.RESEND_API_KEY) {
                    console.warn("RESEND_API_KEY is not set. Email not sent.");
                }

                const { error: emailError } = await resend.emails.send({
                    from: 'EBI 360 <onboarding@resend.dev>', // Update this when domain is verified
                    to: email,
                    subject: subject,
                    html: htmlContent
                });

                // 4. Log Email
                await supabaseAdmin.from('email_logs').insert({
                    to_email: email,
                    template_type: 'invite_company_admin',
                    status: emailError ? 'failed' : 'sent',
                    error_message: emailError?.message,
                    metadata: { company_id: companyId },
                    sent_by: user.id
                });

                if (emailError) {
                    console.error("Resend API Error:", emailError);
                    console.warn("Email failed to send via Resend.");
                } else {
                    console.log("Invitation sent via Resend to:", email);
                }

            } catch (emailError: any) {
                console.warn("Resend exception:", emailError);
                // Log exception
                await supabaseAdmin.from('email_logs').insert({
                    to_email: email,
                    template_type: 'invite_company_admin',
                    status: 'failed',
                    error_message: emailError.message || String(emailError),
                    metadata: { company_id: companyId },
                    sent_by: user.id
                });
            }
        }

        revalidatePath("/admin/super/companies");
        return { success: true };
    } catch (error: any) {
        console.error("Error inviting company admin:", error);
        return { error: error.message || "Failed to invite admin" };
    }
}

// New action: Invite Super Admin
export async function inviteSuperAdmin(email: string, fullName: string) {
    const supabase = await createClient();

    // Verify current user is super admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    const { data: profile } = await supabase
        .from('profiles')
        .select('role, active_role')
        .eq('id', user.id)
        .single();

    const activeRole = profile?.active_role || profile?.role;
    if (activeRole !== 'super_admin') {
        return { error: "Unauthorized: Super Admin only" };
    }

    // Validate that SERVICE_ROLE_KEY is configured
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.error("SUPABASE_SERVICE_ROLE_KEY is not configured");
        return { error: "Server configuration error: Missing service role key. Please contact support." };
    }

    // Use Admin Client for privileged operations
    const supabaseAdmin = createAdminClient();

    try {
        // Invite new super admin user
        const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
            type: 'invite',
            email: email,
            options: {
                redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
                data: {
                    full_name: fullName,
                    role: 'super_admin',
                    active_role: 'super_admin',
                    admin_status: 'invited',
                    company_id: null
                }
            }
        });

        if (linkError) {
            console.error("Error generating link:", linkError);
            throw new Error("No se pudo generar el enlace de invitación");
        }

        const { user: newUser, properties } = linkData;
        const inviteLink = properties.action_link;

        // 2. Upsert profile (user is created by generateLink if not exists)
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .upsert({
                id: newUser.id,
                email: email,
                full_name: fullName,
                role: 'super_admin',
                active_role: 'super_admin',
                roles: ['super_admin', 'company_admin'],
                admin_status: 'invited',
                company_id: null
            });

        if (profileError) {
            console.error("Error creating profile:", profileError);
            throw new Error(`Error al crear perfil: ${profileError.message}`);
        }

        // 3. Prepare Email Content
        // 3.1 Fetch template
        const { data: template } = await supabaseAdmin
            .from('email_templates')
            .select('*')
            .eq('type', 'invite_super_admin')
            .single();

        // Default fallback if no template found
        const defaultSubject = 'Invitación a EBI 360';
        let subject = template?.subject || defaultSubject;
        let htmlContent = template?.body_html || `
             <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                 <h1 style="color: #7e22ce;">Bienvenido a EBI 360</h1>
                 <p>Hola <strong>{{full_name}}</strong>,</p>
                 <p>Has sido invitado a unirte a EBI 360 con permisos de <strong>Super Administrador</strong>.</p>
                 <p>Para comenzar, por favor acepta la invitación haciendo clic en el siguiente botón:</p>
                 <div style="text-align: center; margin: 30px 0;">
                     <a href="{{invite_link}}" style="background-color: #7e22ce; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                         Aceptar Invitación
                     </a>
                 </div>
             </div>
            `;

        // 3.2 Replace variables
        htmlContent = htmlContent
            .replace(/{{full_name}}/g, fullName)
            .replace(/{{invite_link}}/g, inviteLink);

        // 3.3 Send Email via Resend
        try {
            // If RESEND_API_KEY is not set, this will fail. We should catch it.
            if (!process.env.RESEND_API_KEY) {
                console.warn("RESEND_API_KEY is not set. Email not sent.");
            }

            const { error: emailError } = await resend.emails.send({
                from: 'EBI 360 <onboarding@resend.dev>', // Update this when domain is verified
                to: email,
                subject: subject,
                html: htmlContent
            });

            // 4. Log Email
            await supabaseAdmin.from('email_logs').insert({
                to_email: email,
                template_type: 'invite_super_admin',
                status: emailError ? 'failed' : 'sent',
                error_message: emailError?.message,
                metadata: { role: 'super_admin' },
                sent_by: user.id
            });

            if (emailError) {
                console.error("Resend API Error:", emailError);
                console.warn("Email failed to send via Resend.");
            } else {
                console.log("Invitation sent via Resend to:", email);
            }

        } catch (emailError: any) {
            console.warn("Resend exception:", emailError);
            // Log exception
            await supabaseAdmin.from('email_logs').insert({
                to_email: email,
                template_type: 'invite_super_admin',
                status: 'failed',
                error_message: emailError.message || String(emailError),
                metadata: { role: 'super_admin' },
                sent_by: user.id
            });
        }
        revalidatePath("/admin/super/admins");
        return { success: true };
    } catch (error: any) {
        console.error("Error inviting super admin:", error);
        return { error: error.message || "Failed to invite super admin" };
    }
}


export async function updateCompany(companyId: string, formData: FormData) {
    const supabase = await createClient();

    // Verify super admin role
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    const { data: adminProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (adminProfile?.role !== 'super_admin') {
        return { error: "Unauthorized: Super Admin only" };
    }

    const name = formData.get("name") as string;
    const plan = formData.get("plan") as "basic" | "pro" | "enterprise";
    const active = formData.get("active") === "on";

    try {
        const { error } = await supabase
            .from("companies")
            .update({
                name,
                subscription_plan: plan,
                active
            })
            .eq("id", companyId);

        if (error) throw error;

        revalidatePath("/admin/super/companies");
        revalidatePath("/admin/super");
        return { success: true };
    } catch (error: any) {
        console.error("Error updating company:", error);
        return { error: error.message || "Failed to update company" };
    }
}

export async function deleteCompany(companyId: string) {
    const supabase = await createClient();

    // Verify super admin role
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    const { data: adminProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (adminProfile?.role !== 'super_admin') {
        return { error: "Unauthorized: Super Admin only" };
    }

    try {
        // Note: This might fail if there are foreign key constraints (users, results, surveys)
        // Ideally we should use CASCADE in DB or delete related data first.
        // For now, we assume the DB handles cascade or we catch the error.
        const { error } = await supabase
            .from("companies")
            .delete()
            .eq("id", companyId);

        if (error) throw error;

        revalidatePath("/admin/super/companies");
        revalidatePath("/admin/super");
        return { success: true };
    } catch (error: any) {
        console.error("Error deleting company:", error);
        return { error: error.message || "Failed to delete company. Ensure it has no active users." };
    }
}

export async function updateAdminStatus(adminId: string, newStatus: 'invited' | 'active' | 'inactive' | 'suspended') {
    const supabase = await createClient();

    // Verify super admin role
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    const { data: adminProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (adminProfile?.role !== 'super_admin') {
        return { error: "Unauthorized: Super Admin only" };
    }

    const supabaseAdmin = createAdminClient();

    try {
        const { error } = await supabaseAdmin
            .from('profiles')
            .update({ admin_status: newStatus })
            .eq('id', adminId)
            .eq('role', 'company_admin'); // Extra safety check

        if (error) throw error;

        revalidatePath("/admin/super/companies");
        return { success: true };
    } catch (error: any) {
        console.error("Error updating admin status:", error);
        return { error: error.message || "Failed to update admin status" };
    }
}

export async function resendAdminInvitation(adminId: string) {
    const supabase = await createClient();

    // Verify super admin role
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    const { data: adminProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (adminProfile?.role !== 'super_admin') {
        return { error: "Unauthorized: Super Admin only" };
    }

    const supabaseAdmin = createAdminClient();

    try {
        // Get admin details
        const { data: admin, error: fetchError } = await supabaseAdmin
            .from('profiles')
            .select('email, full_name, company_id')
            .eq('id', adminId)
            .single();

        if (fetchError || !admin) {
            throw new Error("Admin not found");
        }

        // Resend invitation
        const { error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
            admin.email,
            {
                data: {
                    full_name: admin.full_name,
                    company_id: admin.company_id,
                    role: 'company_admin',
                    admin_status: 'invited',
                },
                redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
            }
        );

        if (inviteError) throw inviteError;

        revalidatePath("/admin/super/companies");
        return { success: true };
    } catch (error: any) {
        console.error("Error resending invitation:", error);
        return { error: error.message || "Failed to resend invitation" };
    }
}

export async function switchRole(newRole: 'super_admin' | 'company_admin' | 'employee') {
    const supabase = await createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    try {
        // Verify user has access to this role
        const { data: profile, error: fetchError } = await supabase
            .from('profiles')
            .select('roles, active_role')
            .eq('id', user.id)
            .single();

        if (fetchError || !profile) {
            throw new Error("Profile not found");
        }

        // Check if user has this role
        if (!profile.roles?.includes(newRole)) {
            return { error: "No tienes acceso a este rol" };
        }

        // Update active role
        const { error: updateError } = await supabase
            .from('profiles')
            .update({ active_role: newRole })
            .eq('id', user.id);

        if (updateError) throw updateError;

        // Revalidate relevant paths
        revalidatePath('/perfil');
        revalidatePath('/admin/super');
        revalidatePath('/admin/company');
        revalidatePath('/diagnostico');

        return { success: true, newRole };
    } catch (error: any) {
        console.error("Error switching role:", error);
        return { error: error.message || "Failed to switch role" };
    }
}

export async function inviteEmployee(email: string, fullName: string) {
    const supabase = await createClient();

    // Verify company admin role (or super admin)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    const { data: profile } = await supabase
        .from('profiles')
        .select('role, active_role, company_id')
        .eq('id', user.id)
        .single();

    // Check permissions using active_role for multi-role support
    const activeRole = profile?.active_role || profile?.role;

    if (activeRole !== 'company_admin' && activeRole !== 'super_admin') {
        return { error: "Unauthorized: Company Admin only" };
    }

    const companyId = profile?.company_id;
    if (!companyId) {
        return { error: "No company assigned to admin" };
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.error("SUPABASE_SERVICE_ROLE_KEY is not configured");
        return { error: "Server configuration error: Missing service role key." };
    }

    const supabaseAdmin = createAdminClient();

    try {
        // 1. Check if profile already exists
        const { data: existingProfile } = await supabaseAdmin
            .from('profiles')
            .select('id, email')
            .eq('email', email)
            .single();

        if (existingProfile) {
            return { error: "Este email ya está registrado en el sistema." };
        }

        // 2. Create user in auth.users first (this generates the ID)
        // We create with email_confirm: false so they need to verify via Google login
        const { data: authUser, error: createAuthError } = await supabaseAdmin.auth.admin.createUser({
            email: email,
            email_confirm: false, // User must login with Google to confirm
            user_metadata: {
                full_name: fullName,
                company_id: companyId,
                role: 'employee'
            }
        });

        if (createAuthError) {
            console.error("Error creating auth user:", createAuthError);
            throw new Error(`Error al crear usuario: ${createAuthError.message}`);
        }

        if (!authUser.user) {
            throw new Error("No se pudo crear el usuario en auth");
        }

        // 3. Create profile with the same ID from auth.users
        // This should be handled by the trigger, but we'll ensure it exists
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .upsert({
                id: authUser.user.id, // Use the ID from auth.users
                email: email,
                full_name: fullName,
                role: 'employee',
                company_id: companyId,
                active_role: 'employee',
                roles: ['employee'],
                admin_status: 'invited'
            });

        if (profileError) {
            console.error("Error creating profile:", profileError);
            // Try to clean up the auth user if profile creation fails
            await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
            throw new Error(`Error al crear perfil: ${profileError.message}`);
        }

        // 4. Optionally try to send invitation email (non-blocking)
        let emailSent = false;
        try {
            const { error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
                email,
                {
                    data: {
                        full_name: fullName,
                        company_id: companyId,
                        role: 'employee',
                    },
                    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
                }
            );

            if (!inviteError) {
                emailSent = true;
            } else {
                console.warn("Email invitation failed (non-critical):", inviteError.message);
            }
        } catch (emailError) {
            console.warn("Email invitation failed (non-critical):", emailError);
        }

        revalidatePath("/admin/company/employees");

        return {
            success: true,
            emailSent,
            message: emailSent
                ? "Usuario registrado e invitación enviada por email."
                : "Usuario registrado. Podrá ingresar con Google usando este email."
        };
    } catch (error: any) {
        console.error("Error inviting employee:", error);
        return { error: error.message || "Failed to invite employee" };
    }
}

// New action: Update employee details
export async function updateEmployee(employeeId: string, fullName: string, email: string) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    const { data: profile } = await supabase
        .from('profiles')
        .select('role, active_role, company_id')
        .eq('id', user.id)
        .single();

    const activeRole = profile?.active_role || profile?.role;

    if (activeRole !== 'company_admin' && activeRole !== 'super_admin') {
        return { error: "Unauthorized: Admin only" };
    }

    if (!profile?.company_id) {
        return { error: "No company assigned" };
    }

    try {
        const { error } = await supabase
            .from('profiles')
            .update({
                full_name: fullName,
                email: email
            })
            .eq('id', employeeId)
            .eq('company_id', profile.company_id); // Security: only update own company's employees

        if (error) throw error;

        revalidatePath("/admin/company/employees");
        return { success: true };
    } catch (error: any) {
        console.error("Error updating employee:", error);
        return { error: error.message || "Failed to update employee" };
    }
}

// New action: Toggle employee active status
export async function toggleEmployeeStatus(employeeId: string, active: boolean) {
    const supabase = await createClient();

    const { data: { user } = {} } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    const { data: profile } = await supabase
        .from('profiles')
        .select('role, active_role, company_id')
        .eq('id', user.id)
        .single();

    const activeRole = profile?.active_role || profile?.role;

    if (activeRole !== 'company_admin' && activeRole !== 'super_admin') {
        return { error: "Unauthorized: Admin only" };
    }

    if (!profile?.company_id) {
        return { error: "No company assigned" };
    }

    // We'll use a custom field 'is_active' - need to add this to profiles table
    // For now, we can use admin_status field
    try {
        const { error } = await supabase
            .from('profiles')
            .update({
                admin_status: active ? 'active' : 'inactive'
            })
            .eq('id', employeeId)
            .eq('company_id', profile.company_id);

        if (error) throw error;

        revalidatePath("/admin/company/employees");
        return { success: true };
    } catch (error: any) {
        console.error("Error toggling employee status:", error);
        return { error: error.message || "Failed to update status" };
    }
}

// New action: Delete employee
export async function deleteEmployee(employeeId: string) {
    const supabase = await createClient();

    const { data: { user } = {} } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    const { data: profile } = await supabase
        .from('profiles')
        .select('role, active_role, company_id')
        .eq('id', user.id)
        .single();

    const activeRole = profile?.active_role || profile?.role;

    if (activeRole !== 'company_admin' && activeRole !== 'super_admin') {
        return { error: "Unauthorized: Admin only" };
    }

    if (!profile?.company_id) {
        return { error: "No company assigned" };
    }

    const supabaseAdmin = createAdminClient();

    try {
        // Delete from auth.users first
        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(employeeId);

        // Even if auth delete fails (user might not exist in auth yet), continue to delete profile
        if (authError) {
            console.warn("Auth user delete failed (might not exist yet):", authError.message);
        }

        // Delete profile
        const { error: profileError } = await supabase
            .from('profiles')
            .delete()
            .eq('id', employeeId)
            .eq('company_id', profile.company_id);

        if (profileError) throw profileError;

        revalidatePath("/admin/company/employees");
        return { success: true };
    } catch (error: any) {
        console.error("Error deleting employee:", error);
        return { error: error.message || "Failed to delete employee" };
    }
}

// New action: Update company branding
export async function updateCompanyBranding(formData: FormData) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    const { data: profile } = await supabase
        .from('profiles')
        .select('role, active_role, company_id')
        .eq('id', user.id)
        .single();

    const activeRole = profile?.active_role || profile?.role;

    if (activeRole !== 'company_admin' && activeRole !== 'super_admin') {
        return { error: "Unauthorized: Admin only" };
    }

    if (!profile?.company_id) {
        return { error: "No company assigned" };
    }

    const supabaseAdmin = createAdminClient();

    try {
        const primaryColor = formData.get('primaryColor') as string;
        const secondaryColor = formData.get('secondaryColor') as string;
        const font = formData.get('font') as string || 'Inter';
        const logoFile = formData.get('logo') as File | null;

        let logoUrl: string | undefined;

        // Upload logo if provided
        if (logoFile && logoFile.size > 0) {
            const fileExt = logoFile.name.split('.').pop();
            const fileName = `${profile.company_id}-${Date.now()}.${fileExt}`;
            const filePath = `company-logos/${fileName}`;

            const { error: uploadError } = await supabaseAdmin.storage
                .from('logos')
                .upload(filePath, logoFile, {
                    cacheControl: '3600',
                    upsert: true
                });

            if (uploadError) {
                console.error("Error uploading logo:", uploadError);
                throw new Error(`Error al subir logo: ${uploadError.message}`);
            }

            // Get public URL
            const { data: { publicUrl } } = supabaseAdmin.storage
                .from('logos')
                .getPublicUrl(filePath);

            logoUrl = publicUrl;
        }

        // Update company branding
        const updateData: any = {
            primary_color: primaryColor,
            secondary_color: secondaryColor,
            font: font
        };

        if (logoUrl) {
            updateData.logo_url = logoUrl;
        }

        console.log("Updating company branding:", {
            company_id: profile.company_id,
            updateData
        });

        const { data: updatedCompany, error: updateError } = await supabase
            .from('companies')
            .update(updateData)
            .eq('id', profile.company_id)
            .select();

        console.log("Update result:", { updatedCompany, updateError });

        if (updateError) {
            throw new Error(`Error al actualizar branding: ${updateError.message}`);
        }

        revalidatePath("/admin/company/settings");
        revalidatePath("/admin/company");
        return { success: true, logoUrl };
    } catch (error: any) {
        console.error("Error updating company branding:", error);
        return { error: error.message || "Failed to update branding" };
    }
}
