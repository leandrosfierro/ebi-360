"use server";

import { createClient } from "@/lib/supabase/server";
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
