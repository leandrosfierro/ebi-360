"use server";

import { createClient } from "@/lib/supabase/server";
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { revalidatePath } from "next/cache";

export async function forceRoleUpdate() {
    console.log("Starting Debug Action...");

    try {
        // 1. Check Env Vars first (Safely)
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

        if (!serviceKey) {
            console.error("FATAL: SUPABASE_SERVICE_ROLE_KEY is missing.");
            return {
                success: false,
                error: "ERROR CRÍTICO: Falta la variable 'SUPABASE_SERVICE_ROLE_KEY' en la configuración de Vercel. Por favor agrégala en Project Settings > Environment Variables."
            };
        }

        if (!supabaseUrl) {
            return { success: false, error: "Falta NEXT_PUBLIC_SUPABASE_URL" };
        }

        // 2. Authenticate user
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return { success: false, error: "No estás autenticado." };
        }

        if (user.email !== 'leandro.fierro@bs360.com.ar') {
            return { success: false, error: "Usuario no autorizado." };
        }

        // 3. Manual Admin Client creation (to avoid import issues)
        const adminClient = createSupabaseClient(supabaseUrl, serviceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });

        // 4. Update
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
            return { success: false, error: "DB Error: " + updateError.message };
        }

        revalidatePath('/', 'layout');

        return {
            success: true,
            message: "¡ÉXITO TOTAL! Permisos actualizados. Recargando..."
        };

    } catch (e: any) {
        return { success: false, error: "Excepción: " + e.message };
    }
}
