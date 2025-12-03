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
