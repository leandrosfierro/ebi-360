"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function forceRoleUpdate() {
    console.log("Forcing permission update...");
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "No user found" };
    }

    try {
        // 1. Fetch RAW profile
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        console.log("Raw Profile Scan:", profile, error);

        if (!profile) return { error: "Profile missing" };

        const roles = profile.roles || [];
        // If roles is empty or employee, we try to auto-promote based on email (Desperate measure)
        if (user.email === 'leandro.fierro@bs360.com.ar') {
            console.log("Target user found. Forcing Super Admin privileges.");
            await supabase
                .from('profiles')
                .update({
                    role: 'super_admin',
                    active_role: 'super_admin',
                    roles: ['super_admin', 'company_admin', 'employee']
                })
                .eq('id', user.id);

            revalidatePath('/');
            revalidatePath('/perfil');
            return {
                success: true,
                message: "Permisos de Super Admin Forzados. Recarga la página."
            };
        }

        return {
            success: true,
            data: {
                role: profile.role,
                active_role: profile.active_role,
                roles: profile.roles
            }
        };

    } catch (e: any) {
        return { error: e.message };
    }
}
