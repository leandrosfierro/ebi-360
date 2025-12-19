import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    // if "next" is in param, use it as the redirect URL
    const next = searchParams.get("next") ?? "/";

    if (code) {
        const supabase = await createClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
            // Get user and create/update profile
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const metadata = user.user_metadata || {};

                // Preservación y auto-reparación de roles
                const { data: existingProfile } = await supabase
                    .from('profiles')
                    .select('role, roles, active_role, email, full_name, company_id')
                    .eq('id', user.id)
                    .maybeSingle();

                // Prioridad de rol: Perfil existente -> Metadata de Auth -> Default
                let finalRole = existingProfile?.role || metadata.role || 'employee';

                // Si el email es Leandro Fierro o admin de BS360, forzar super_admin
                const userEmail = user.email?.toLowerCase() || '';
                const isMaster = userEmail.includes('leandro.fierro') ||
                    userEmail.includes('leandrofierro') ||
                    userEmail.includes('admin@bs360');

                if (isMaster) {
                    finalRole = 'super_admin';
                }

                let finalRoles = existingProfile?.roles || [finalRole];

                // Si es super_admin (por email o por DB), asegurar que tenga el array completo
                if (finalRole === 'super_admin' || finalRoles.includes('super_admin') || isMaster) {
                    finalRole = 'super_admin';
                    if (!finalRoles.includes('super_admin') || !finalRoles.includes('company_admin')) {
                        finalRoles = ['super_admin', 'company_admin', 'employee'];
                    }
                }

                const finalActiveRole = existingProfile?.active_role || finalRole;

                console.log(">>> [AUTH CALLBACK] Final Roles for user:", { id: user.id, email: user.email, finalRole, finalRoles });

                await supabase
                    .from('profiles')
                    .upsert({
                        id: user.id,
                        email: user.email!,
                        full_name: metadata.full_name || metadata.name || existingProfile?.full_name || '',
                        role: finalRole,
                        active_role: finalActiveRole,
                        roles: finalRoles,
                        company_id: metadata.company_id || existingProfile?.company_id || null,
                        admin_status: 'active',
                        last_active_at: new Date().toISOString()
                    }, {
                        onConflict: 'id'
                    });
            }

            // Robust redirect
            const redirectUrl = new URL(next === '/' ? '/perfil' : next, request.url);
            return NextResponse.redirect(redirectUrl);
        }
    }

    // fallback to login with error param instead of non-existent page
    const errorUrl = new URL('/login', request.url);
    errorUrl.searchParams.set('error', 'auth_failed');
    return NextResponse.redirect(errorUrl);
}
