"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { revalidatePath } from "next/cache";

export async function forceRoleUpdate() {
    console.log("Starting Safe Debug Action...");

    // 1. Safe Env Check (Try-Catch to prevent any crash)
    let serviceKey;
    let supabaseUrl;

    try {
        serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    } catch (e) {
        return { success: false, error: "Error leyendo variables de entorno." };
    }

    // 2. Clear handling of missing key
    if (!serviceKey) {
        return {
            success: false,
            error: "FALTA CONFIGURACIÓN: Ve a Vercel > Settings > Env Vars y agrega 'SUPABASE_SERVICE_ROLE_KEY'. Cópiala de tu archivo .env.local."
        };
    }

    if (!supabaseUrl) {
        return { success: false, error: "Falta NEXT_PUBLIC_SUPABASE_URL en Vercel." };
    }

    try {
        // 3. Authenticate user
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return { success: false, error: "No estás autenticado. Recarga y logueate." };
        }

        // 4. Create Admin Client
        const adminClient = createSupabaseClient(supabaseUrl, serviceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });

        // 5. Force Update
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
            return { success: false, error: "Error de Base de Datos: " + updateError.message };
        }

        revalidatePath('/', 'layout');

        return {
            success: true,
            message: "¡Rol actualizado correctamente! La página se recargará."
        };

    } catch (e: any) {
        console.error("Debug Action Execption:", e);
        return { success: false, error: "Error inesperado: " + e.message };
    }
}
