"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { resend } from "@/lib/resend";
import { sendManualInvitations } from "@/lib/invitation-actions";
import { isSuperAdminEmail, SUPER_ADMIN_FULL_ROLES } from "@/config/super-admins";

// Roles are now synced automatically in auth/callback/route.ts
// Legacy patch functions removed.

/**
 * Helper to check if a user has administrative access to a company context.
 * Allows super_admin, company_admin, rrhh and consultor_bs360.
 */
function hasAdminAccess(email: string | undefined, profile: any) {
    // 1. MASTER WHITELIST (Highest priority)
    if (isSuperAdminEmail(email || '')) return true;

    // 2. Profile role columns (Fallback)
    const activeRole = profile?.active_role || profile?.role || 'employee';
    const userRoles = profile?.roles || (profile?.role ? [profile.role] : []);

    const adminRoles = ['super_admin', 'company_admin', 'rrhh', 'consultor_bs360'];

    // 3. Explicit check
    const isAuthorized = adminRoles.includes(activeRole) ||
        userRoles.some((r: string) => adminRoles.includes(r)) ||
        profile?.role === 'super_admin' ||
        profile?.role === 'company_admin';

    if (!isAuthorized) {
        console.warn(`[hasAdminAccess] Denied: email=${email}, activeRole=${activeRole}, roles=${JSON.stringify(userRoles)}`);
    }

    return isAuthorized;
}

/**
 * Helper to check if a user is a super admin.
 */
function isSuperAdmin(email: string | undefined, profile: any) {
    if (isSuperAdminEmail(email || '')) return true;

    const activeRole = profile?.active_role || profile?.role || 'employee';
    const userRoles = profile?.roles || (profile?.role ? [profile.role] : []);

    return activeRole === 'super_admin' ||
        userRoles.includes('super_admin') ||
        profile?.role === 'super_admin';
}

export async function saveDiagnosticResult(
    globalScore: number,
    domainScores: Record<string, number>,
    answers: Record<string, number>,
    surveyId?: string
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
            survey_id: surveyId
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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    // Use Admin Client for role check to bypass RLS recursion
    const supabaseAdmin = createAdminClient();
    const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('role, roles, active_role')
        .eq('id', user.id)
        .single();

    if (profileError || profile?.role !== 'super_admin') {
        console.error("Access denied in createCompany:", profileError || "Not a super_admin");
        return { error: "Unauthorized: Super Admin only" };
    }

    const name = formData.get("name") as string;
    const plan = formData.get("plan") as "basic" | "pro" | "enterprise";
    const active = formData.get("active") === "on";

    try {
        // Use Admin Client to bypass RLS for critical creation tasks
        const { error } = await supabaseAdmin.from("companies").insert({
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
        .select('role, roles, active_role, company_id')
        .eq('id', user.id)
        .single();

    if (!hasAdminAccess(user.email, profile)) {
        console.warn(`[bulkUploadUsers] Access DENIED for ${user.email}. Profile:`, profile);
        return { error: "Acceso denegado: Solo administradores [v1.1]" };
    }

    const companyId = profile?.company_id;
    if (!companyId) {
        return { error: "No company assigned to admin" };
    }

    const areaMap = new Map<string, string>();
    const { data: existingAreas } = await supabase
        .from('areas')
        .select('id, name')
        .eq('company_id', companyId);

    if (existingAreas) {
        existingAreas.forEach(a => areaMap.set(a.name.toLowerCase(), a.id));
    }

    const errors: string[] = [];
    let created = 0;
    const createdIds: string[] = [];

    for (const userData of users) {
        try {
            // Check if user already exists
            const { data: existingUser } = await supabase
                .from('profiles')
                .select('id')
                .eq('email', userData.email)
                .maybeSingle();

            if (existingUser) {
                errors.push(`${userData.email}: Usuario ya existe`);
                continue;
            }

            let areaId = null;
            if (userData.department) {
                const deptName = userData.department.trim();
                const normalizedName = deptName.toLowerCase();

                if (areaMap.has(normalizedName)) {
                    areaId = areaMap.get(normalizedName);
                } else {
                    // Create new area on the fly
                    const { data: newArea, error: areaError } = await supabase
                        .from('areas')
                        .insert({ name: deptName, company_id: companyId })
                        .select('id')
                        .single();

                    if (!areaError && newArea) {
                        areaId = newArea.id;
                        areaMap.set(normalizedName, areaId);
                    }
                }
            }

            const supabaseAdmin = createAdminClient();

            // Create user silently (without default invite email)
            const { data: authUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
                email: userData.email,
                email_confirm: false,
                user_metadata: {
                    full_name: userData.full_name,
                    company_id: companyId,
                    role: 'employee',
                    area_id: areaId
                }
            });

            if (createError) {
                errors.push(`${userData.email}: ${createError.message}`);
                continue;
            }

            if (authUser.user) {
                // Ensure profile exists (it should be created by trigger, but we upsert for safety)
                await supabaseAdmin.from('profiles').upsert({
                    id: authUser.user.id,
                    email: userData.email,
                    full_name: userData.full_name,
                    role: 'employee',
                    active_role: 'employee',
                    roles: ['employee'],
                    company_id: companyId,
                    area_id: areaId,
                    admin_status: 'invited'
                });

                createdIds.push(authUser.user.id);
            }

            created++;
        } catch (error: any) {
            errors.push(`${userData.email}: ${error.message || 'Error desconocido'}`);
        }
    }

    // Send branded invitations in batch
    if (createdIds.length > 0) {
        await sendManualInvitations(createdIds);
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

export async function inviteCompanyAdmin(email: string, fullName: string, companyId: string, force: boolean = false) {
    const supabase = await createClient();

    // Verify super admin role
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    const { data: adminProfile } = await supabase
        .from('profiles')
        .select('role, roles, active_role')
        .eq('id', user.id)
        .single();

    if (!isSuperAdmin(user.email, adminProfile)) {
        return { error: "Unauthorized: Super Admin only" };
    }

    // Validate that SERVICE_ROLE_KEY is configured
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.error("SUPABASE_SERVICE_ROLE_KEY is not configured");
        return { error: "Server configuration error: Missing service role key. Please contact support." };
    }

    // Use Admin Client for privileged operations
    const supabaseAdmin = createAdminClient();

    // Validate that SERVICE_ROLE_KEY is configured and not a placeholder
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey || serviceKey.endsWith('1234567890')) {
        console.error("[inviteCompanyAdmin] Configuration Error: SUPABASE_SERVICE_ROLE_KEY is invalid");
        return {
            error: "Error de configuración: La clave de servicio no es válida. Por favor, actualiza SUPABASE_SERVICE_ROLE_KEY en el dashboard de Supabase y en las variables de entorno."
        };
    }

    let inviteLink: string | undefined;
    console.log(`[inviteCompanyAdmin] Starting invitation for: ${email}`);

    try {
        // 1. Check if user already exists in profiles
        const { data: existingProfile } = await supabaseAdmin
            .from('profiles')
            .select('id, company_id, email, full_name, role, roles, active_role')
            .ilike('email', email)
            .maybeSingle();

        let userId = existingProfile?.id;
        let userBelongsToOtherCompany = existingProfile && existingProfile.company_id && existingProfile.company_id !== companyId;

        // 1.2 If no profile, check if user exists in Auth
        if (!userId) {
            const { data: authUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
            if (listError) {
                console.error("Error listing users:", listError);
            } else {
                const existingAuthUser = authUsers.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
                if (existingAuthUser) {
                    userId = existingAuthUser.id;
                }
            }
        }

        // 1.3 Check if we need confirmation
        if (userBelongsToOtherCompany && !force) {
            return {
                needsConfirmation: true,
                message: `El usuario ya está registrado en otra empresa. ¿Deseas asignarlo como administrador de esta empresa también?`
            };
        }

        if (userId) {
            // MERGE roles to avoid losing Super Admin or other privileges
            let newRoles: string[] = existingProfile?.roles || [];
            if (!newRoles.includes('company_admin')) newRoles.push('company_admin');
            if (!newRoles.includes('employee')) newRoles.push('employee');

            const finalRoleForExisting = existingProfile?.role === 'super_admin' ? 'super_admin' : 'company_admin';
            const finalActiveRoleForExisting = existingProfile?.role === 'super_admin' ? 'super_admin' : 'company_admin';

            // 1. Update Profile table
            const { error: profileError } = await supabaseAdmin
                .from('profiles')
                .upsert({
                    id: userId,
                    email: email,
                    full_name: fullName || existingProfile?.full_name || '',
                    role: finalRoleForExisting,
                    active_role: finalActiveRoleForExisting,
                    roles: newRoles,
                    company_id: companyId,
                    admin_status: 'active'
                });

            if (profileError) {
                console.error("[inviteCompanyAdmin] Profile Upsert Error:", profileError);
                throw new Error(`Error al actualizar perfil: ${profileError.message}`);
            }
            console.log(`[inviteCompanyAdmin] Profile successfully updated for existing user: ${userId}`);

            // 2. Update Auth Metadata - THIS ENABLES IMMEDIATE ACCESS FOR EXISTING GOOGLE/EMAIL USERS
            await supabaseAdmin.auth.admin.updateUserById(userId, {
                user_metadata: {
                    role: finalRoleForExisting,
                    active_role: finalActiveRoleForExisting,
                    roles: newRoles,
                    company_id: companyId,
                    admin_status: 'active' // They already exist, so they are active
                }
            });

            revalidatePath("/admin/super/companies");
            return {
                success: true,
                message: "Usuario existente asignado como administrador exitosamente."
            };
        } else {
            // 2. Invite new user (since they don't exist in either place)
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
                throw new Error(`Error al generar invitación: ${linkError.message}`);
            }

            const { user: newUser, properties } = linkData;
            inviteLink = properties.action_link;

            // 2.2 Upsert profile
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
                    invitation_link: inviteLink
                });

            if (profileError) {
                console.error("Error creating profile:", profileError);
                throw new Error(`Error al crear perfil: ${profileError.message}`);
            }

            // 3. Send Email
            try {
                const { data: template } = await supabaseAdmin
                    .from('email_templates')
                    .select('*')
                    .eq('type', 'invite_company_admin')
                    .single();

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

                htmlContent = htmlContent
                    .replace(/{{full_name}}/g, fullName)
                    .replace(/{{invite_link}}/g, inviteLink);

                if (!process.env.RESEND_API_KEY) {
                    console.warn("RESEND_API_KEY is not set.");
                } else {
                    const { error: emailError } = await resend.emails.send({
                        from: 'EBI 360 <onboarding@resend.dev>',
                        to: email,
                        subject: subject,
                        html: htmlContent
                    });

                    await supabaseAdmin.from('email_logs').insert({
                        to_email: email,
                        template_type: 'invite_company_admin',
                        status: emailError ? 'failed' : 'sent',
                        error_message: emailError?.message,
                        metadata: { company_id: companyId },
                        sent_by: user.id
                    });
                }
            } catch (emailErr) {
                console.warn("Email silent fail:", emailErr);
            }
        }

        revalidatePath("/admin/super/companies");
        return { success: true, inviteLink };
    } catch (error: any) {
        console.error("Error in invitation:", error);
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

    // Validate that SERVICE_ROLE_KEY is configured and not a placeholder
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey || serviceKey.endsWith('1234567890')) {
        console.error("[inviteSuperAdmin] Configuration Error: SUPABASE_SERVICE_ROLE_KEY is invalid");
        return {
            error: "Error de configuración: La clave de servicio no es válida. Por favor, actualiza SUPABASE_SERVICE_ROLE_KEY en el dashboard de Supabase y en las variables de entorno."
        };
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
                roles: SUPER_ADMIN_FULL_ROLES,
                admin_status: 'invited',
                company_id: null,
                invitation_link: inviteLink
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
        return { success: true, inviteLink };
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
        .select('role, roles, active_role')
        .eq('id', user.id)
        .single();

    if (!isSuperAdmin(user.email, adminProfile)) {
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
        .select('role, roles, active_role')
        .eq('id', user.id)
        .single();

    if (!isSuperAdmin(user.email, adminProfile)) {
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
        .select('role, roles, active_role')
        .eq('id', user.id)
        .single();

    if (!isSuperAdmin(user.email, adminProfile)) {
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
        .select('role, roles, active_role')
        .eq('id', user.id)
        .single();

    if (!isSuperAdmin(user.email, adminProfile)) {
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

        // 2. Generate NEW invitation link (refreshes the link)
        const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
            type: 'invite',
            email: admin.email,
            options: {
                redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
                data: {
                    full_name: admin.full_name,
                    company_id: admin.company_id,
                    role: 'company_admin',
                    active_role: 'company_admin',
                    admin_status: 'invited',
                }
            }
        });

        if (linkError) {
            console.error("Error generating link for resend:", linkError);
            throw new Error(`Error al generar invitación: ${linkError.message}`);
        }

        const inviteLink = linkData.properties.action_link;

        // 3. Update profile with NEW link
        await supabaseAdmin
            .from('profiles')
            .update({
                admin_status: 'invited',
                invitation_link: inviteLink
            })
            .eq('id', adminId);

        // 4. Send Email manually using Resend (to match the styling/template)
        // (Optional: You could also reuse the email logic from inviteCompanyAdmin here if needed)

        revalidatePath("/admin/super/companies");
        return { success: true, inviteLink };
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
        // 🛡️ Use Service Role for atomic sync and bypassing RLS if needed
        const supabaseAdmin = createAdminClient();

        // 1. Verify user has access to this role (from DB source of truth)
        const { data: profile, error: fetchError } = await supabaseAdmin
            .from('profiles')
            .select('roles, active_role, company_id, full_name')
            .eq('id', user.id)
            .single();

        if (fetchError || !profile) {
            console.error("[switchRole] Profile fetch error:", fetchError);
            throw new Error("No se pudo verificar el perfil del usuario.");
        }

        let userRolesList = profile.roles || [];
        const userEmail = user.email?.toLowerCase() || '';
        const isMaster = isSuperAdminEmail(userEmail);

        // Auto-fix for Master Admins if roles are missing in DB
        if (isMaster && !userRolesList.includes('super_admin')) {
            userRolesList = ['super_admin', 'company_admin', 'employee'];
        }

        if (!userRolesList.includes(newRole)) {
            return { error: "No tienes permisos para activar este rol." };
        }

        // 2. ATOMIC UPDATE: Database
        const { error: dbError } = await supabaseAdmin
            .from('profiles')
            .update({
                active_role: newRole,
                role: newRole, // Sync main role column
                roles: userRolesList,
                last_active_at: new Date().toISOString()
            })
            .eq('id', user.id);

        if (dbError) throw dbError;

        // 3. ATOMIC UPDATE: Auth Metadata (Sync intent with JWT immediately)
        // This ensures Server Components and RLS (if using JWT) stay in sync.
        const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
            user_metadata: {
                ...user.user_metadata,
                active_role: newRole,
                role: newRole,
                roles: userRolesList,
                company_id: profile.company_id
            }
        });

        if (authError) {
            console.warn("[switchRole] Metadata Sync Warning (Non-fatal):", authError);
        }

        // 4. Clean revalidation
        revalidatePath('/perfil');
        revalidatePath('/admin/super');
        revalidatePath('/admin/company');
        revalidatePath('/wellbeing');

        return { success: true };
    } catch (error: any) {
        console.error("[switchRole] Fatal Error:", error);
        return { error: error.message || "Error al cambiar de rol" };
    }
}


export async function inviteEmployee(email: string, fullName: string) {
    console.log(`[inviteEmployee] Starting invitation for: ${email}`);

    try {
        const supabase = await createClient();
        const { data: { user: adminUser } } = await supabase.auth.getUser();
        if (!adminUser) return { error: "No autorizado" };

        const supabaseAdmin = createAdminClient();

        // 1. Get Admin Profile to identify company
        const { data: adminProfile } = await supabaseAdmin
            .from('profiles')
            .select('company_id, active_role, role, roles')
            .eq('id', adminUser.id)
            .single();

        if (!hasAdminAccess(adminUser.email, adminProfile)) {
            return { error: "No tienes permisos para realizar esta acción." };
        }

        if (!adminProfile?.company_id) {
            return { error: "No tienes una empresa asignada para invitar usuarios." };
        }

        // 2. Check if user already exists in auth
        const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
        const existingUser = users.find(u => u.email?.toLowerCase() === email.toLowerCase());

        if (existingUser) {
            console.log("[inviteEmployee] User already exists, linking to company.");
            return await promoteExistingUserToEmployee(email, adminProfile.company_id);
        }

        // 3. INVITE via Auth
        const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
            data: {
                full_name: fullName,
                company_id: adminProfile.company_id,
                role: 'employee',
                roles: ['employee'],
                active_role: 'employee'
            },
            redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`
        });

        if (inviteError) throw inviteError;

        // 4. Atomic DB Sync (Trigger will handle creation, but we want to ensure fields are set)
        await supabaseAdmin.from('profiles').upsert({
            id: inviteData.user.id,
            email: email,
            full_name: fullName,
            company_id: adminProfile.company_id,
            role: 'employee',
            roles: ['employee'],
            active_role: 'employee',
            admin_status: 'invited'
        });

        revalidatePath("/admin/company/employees");
        return {
            success: true,
            message: "Invitación enviada exitosamente.",
            userId: inviteData.user.id
        };
    } catch (error: any) {
        console.error("[inviteEmployee] Fatal Error:", error);
        return { error: error.message || "Error al procesar la invitación" };
    }
}

/**
 * Helper to handle cases where an invited email is already registered in the system.
 */
async function promoteExistingUserToEmployee(email: string, companyId: string) {
    const supabaseAdmin = createAdminClient();
    const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
    const user = users.find(u => u.email?.toLowerCase() === email.toLowerCase());

    if (!user) return { error: "No se pudo encontrar al usuario existente." };

    const currentRoles = user.user_metadata.roles || [];
    const newRoles = Array.from(new Set([...currentRoles, 'employee']));

    await supabaseAdmin.auth.admin.updateUserById(user.id, {
        user_metadata: {
            ...user.user_metadata,
            company_id: companyId,
            roles: newRoles
        }
    });

    await supabaseAdmin.from('profiles').upsert({
        id: user.id,
        email: email,
        company_id: companyId,
        roles: newRoles,
        role: 'employee',
        active_role: 'employee'
    });

    revalidatePath("/admin/company/employees");
    return { success: true, message: "Usuario existente vinculado a la empresa correctamente." };
}

// New action: Update employee details
export async function updateEmployee(employeeId: string, fullName: string, email: string) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    const { data: profile } = await supabase
        .from('profiles')
        .select('role, roles, active_role, company_id')
        .eq('id', user.id)
        .single();

    if (!hasAdminAccess(user.email, profile)) {
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
        .select('role, roles, active_role, company_id')
        .eq('id', user.id)
        .single();

    if (!hasAdminAccess(user.email, profile)) {
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
        .select('role, roles, active_role, company_id')
        .eq('id', user.id)
        .single();

    if (!hasAdminAccess(user.email, profile)) {
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
        .select('role, roles, active_role, company_id')
        .eq('id', user.id)
        .single();

    if (!hasAdminAccess(user.email, profile)) {
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

export async function removeCompanyAdmin(adminId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    const isMaster = isSuperAdminEmail(user.email || '');
    const { data: profile } = await supabase.from('profiles').select('role, roles, active_role').eq('id', user.id).single();

    if (!isSuperAdmin(user.email, profile)) {
        return { error: "Unauthorized: Super Admin only" };
    }

    const supabaseAdmin = createAdminClient();
    const { error } = await supabaseAdmin
        .from('profiles')
        .update({
            role: 'employee',
            active_role: 'employee',
            company_id: null,
            admin_status: null
        })
        .eq('id', adminId);

    if (error) return { error: error.message };

    revalidatePath("/admin/super/companies");
    return { success: true };
}
