"use server";

import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";

export async function forceRoleUpdate() {
    console.log(">>> [FORCE ACTION] Starting...");

    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !serviceKey) {
            return { success: false, error: "Variables de entorno faltantes" };
        }

        // 1. Get current user
        const supabaseServer = await createServerClient();
        const { data: { user }, error: authError } = await supabaseServer.auth.getUser();

        if (authError || !user) {
            return { success: false, error: "Usuario no autenticado" };
        }

        // 2. Direct Admin Client
        const admin = createClient(supabaseUrl, serviceKey, {
            auth: { autoRefreshToken: false, persistSession: false }
        });

        // 3. Upsert
        const { error: upsertError } = await admin
            .from('profiles')
            .upsert({
                id: user.id,
                email: user.email,
                role: 'super_admin',
                active_role: 'super_admin',
                roles: ['super_admin', 'company_admin', 'employee'],
                admin_status: 'active',
                full_name: user.user_metadata?.full_name || user.user_metadata?.name || 'Administrador',
                last_active_at: new Date().toISOString()
            }, {
                onConflict: 'id'
            });

        if (upsertError) {
            return { success: false, error: "Error DB: " + upsertError.message };
        }

        return { success: true, message: "¡ÉXITO! Recarga la página." };

    } catch (e: any) {
        return { success: false, error: "Error fatal: " + (e.message || "Desconocido") };
    }
}
