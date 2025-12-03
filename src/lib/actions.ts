"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

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
                    company_id: companyId
                })
                .eq('id', existingUser.id);

            if (updateError) {
                console.error("Error updating user:", updateError);
                throw new Error(`Failed to update user: ${updateError.message}`);
            }
        } else {
            // 2. Invite new user
            const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
                email,
                {
                    data: {
                        full_name: fullName,
                        company_id: companyId,
                        role: 'company_admin',
                        admin_status: 'invited',
                    },
                    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
                }
            );

            if (inviteError) {
                console.error("Invite error details:", inviteError);

                // Provide user-friendly error messages
                if (inviteError.message?.includes('User already registered')) {
                    throw new Error("Este email ya está registrado en el sistema");
                } else if (inviteError.message?.includes('rate limit')) {
                    throw new Error("Límite de invitaciones alcanzado. Intenta más tarde.");
                } else if (inviteError.message?.includes('SMTP')) {
                    throw new Error("Error de configuración de email. Verifica la configuración SMTP en Supabase.");
                }

                throw new Error(inviteError.message || "Failed to send invitation");
            }

            console.log("Invitation sent successfully to:", email);
        }

        revalidatePath("/admin/super/companies");
        return { success: true };
    } catch (error: any) {
        console.error("Error inviting admin:", error);
        return { error: error.message || "Failed to invite admin" };
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

    // Validate that SERVICE_ROLE_KEY is configured
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.error("SUPABASE_SERVICE_ROLE_KEY is not configured");
        return { error: "Server configuration error: Missing service role key." };
    }

    const supabaseAdmin = createAdminClient();

    try {
        // 1. Check if user already exists
        const { data: existingUser, error: checkError } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .eq('email', email)
            .single();

        if (checkError && checkError.code !== 'PGRST116') {
            throw new Error(`Database error: ${checkError.message}`);
        }

        if (existingUser) {
            return { error: "Este usuario ya está registrado en el sistema." };
        }

        // 2. Invite new user
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

        if (inviteError) {
            console.error("Invite error details:", inviteError);
            if (inviteError.message?.includes('rate limit')) {
                throw new Error("Límite de invitaciones alcanzado. Intenta más tarde.");
            }
            throw new Error(inviteError.message || "Failed to send invitation");
        }

        revalidatePath("/admin/company/employees");
        return { success: true };
    } catch (error: any) {
        console.error("Error inviting employee:", error);
        return { error: error.message || "Failed to invite employee" };
    }
}
