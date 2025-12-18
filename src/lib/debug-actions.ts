"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export async function forceRoleUpdate() {
    console.log(">>> [DEBUG ACTION] Starting forceRoleUpdate...");

    try {
        // 1. Check Env Vars
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

        if (!serviceKey || !supabaseUrl) {
            console.error(">>> [DEBUG ACTION] Missing environment variables");
            return {
                success: false,
                error: "CONFIGURACIÓN INCOMPLETA: Falta SUPABASE_SERVICE_ROLE_KEY en el servidor."
            };
        }

        // 2. Authenticate user
        console.log(">>> [DEBUG ACTION] Authenticating user...");
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            console.error(">>> [DEBUG ACTION] Auth error:", authError);
            return {
                success: false,
                error: "SESIÓN INVÁLIDA: Por favor cierra sesión y vuelve a entrar."
            };
        }

        console.log(">>> [DEBUG ACTION] Targeting user:", user.id);

        // 3. Create Admin Client
        const adminClient = createSupabaseClient(supabaseUrl, serviceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });

        // 4. Force Upsert
        console.log(">>> [DEBUG ACTION] Executing Upsert...");
        const { error: upsertError } = await adminClient
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
            console.error(">>> [DEBUG ACTION] DB Upsert Error:", upsertError);
            return { success: false, error: "ERROR DB: " + upsertError.message };
        }

        console.log(">>> [DEBUG ACTION] SUCCESS");
        return {
            success: true,
            message: "¡ÉXITO! Ahora tienes permisos de Super Admin."
        };

    } catch (e: any) {
        console.error(">>> [DEBUG ACTION] FATAL CRASH:", e);
        // We return an object instead of throwing
        return {
            success: false,
            error: "FALLO CRÍTICO EN SERVIDOR: " + (e.message || "Error desconocido")
        };
    }
}
