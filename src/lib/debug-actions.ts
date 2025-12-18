"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { revalidatePath } from "next/cache";

export async function forceRoleUpdate() {
    console.log(">>> [DEBUG ACTION] Starting forceRoleUpdate...");

    try {
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

        if (!serviceKey || !supabaseUrl) {
            console.error(">>> [DEBUG ACTION] Missing environment variables");
            return { success: false, error: "Faltan variables de entorno (Service Key o URL)" };
        }

        // 1. Authenticate user using the standard server client
        console.log(">>> [DEBUG ACTION] Authenticating user...");
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            console.error(">>> [DEBUG ACTION] Auth error:", authError);
            return { success: false, error: "No autenticado: " + (authError?.message || "Usuario nulo") };
        }

        console.log(">>> [DEBUG ACTION] User found:", user.id);

        // 2. Create Admin Client
        const adminClient = createSupabaseClient(supabaseUrl, serviceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });

        // 3. Force Update/Upsert
        console.log(">>> [DEBUG ACTION] Updating profile for:", user.id);
        const { data: existing } = await adminClient.from('profiles').select('id').eq('id', user.id).single();

        let result;
        if (!existing) {
            console.log(">>> [DEBUG ACTION] Profile not found, performing INSERT...");
            result = await adminClient.from('profiles').insert({
                id: user.id,
                email: user.email,
                role: 'super_admin',
                active_role: 'super_admin',
                roles: ['super_admin', 'company_admin', 'employee'],
                admin_status: 'active',
                full_name: user.user_metadata?.full_name || user.user_metadata?.name || 'Administrador'
            });
        } else {
            console.log(">>> [DEBUG ACTION] Profile found, performing UPDATE...");
            result = await adminClient.from('profiles').update({
                role: 'super_admin',
                active_role: 'super_admin',
                roles: ['super_admin', 'company_admin', 'employee'],
                admin_status: 'active'
            }).eq('id', user.id);
        }

        if (result.error) {
            console.error(">>> [DEBUG ACTION] DB Error:", result.error);
            return { success: false, error: "Error DB: " + result.error.message };
        }

        console.log(">>> [DEBUG ACTION] Success! Profile updated.");

        // Return success without revalidatePath to avoid immediate render conflicts
        return {
            success: true,
            message: "Permisos de Super Admin concedidos."
        };

    } catch (e: any) {
        console.error(">>> [DEBUG ACTION] FATAL EXCEPTION:", e);
        return {
            success: false,
            error: "Excepción fatal en el servidor: " + (e.message || "Error desconocido")
        };
    }
}
