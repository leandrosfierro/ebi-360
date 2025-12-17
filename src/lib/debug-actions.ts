"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function forceRoleUpdate() {
    console.log("Forcing permission update (ADMIN MODE)...");

    try {
        // 1. Authenticate user normally first
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            console.error("Auth Error:", authError);
            return { success: false, error: "No estás autenticado. Inicia sesión primero." };
        }

        console.log("User identified:", user.email);

        // Security check: Hardcoded safety to only allow YOUR email
        if (user.email !== 'leandro.fierro@bs360.com.ar') {
            return { success: false, error: "Usuario no autorizado para esta operación de debug." };
        }

        // 2. Use ADMIN client to bypass all RLS policies
        const adminClient = createAdminClient();

        console.log("Updating profile via Admin Client...");

        const { error: updateError } = await adminClient
            .from('profiles')
            .update({
                role: 'super_admin',
                active_role: 'super_admin',
                roles: ['super_admin', 'company_admin', 'employee'],
                admin_status: 'active'
            })
            .eq('id', user.id);

        if (updateError) {
            console.error("Update Error:", updateError);
            return { success: false, error: "Database Update Failed: " + updateError.message };
        }

        console.log("Update successful. Revalidating...");

        revalidatePath('/', 'layout'); // Revalidate everything

        return {
            success: true,
            message: "¡ÉXITO! Permisos forzados nivel Dios (Admin Key). Recargando..."
        };

    } catch (e: any) {
        console.error("Critical Exception:", e);
        return { success: false, error: "Excepción Crítica: " + e.message };
    }
}
