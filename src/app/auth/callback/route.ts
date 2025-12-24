import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { isSuperAdminEmail, SUPER_ADMIN_FULL_ROLES, DEFAULT_ROLES } from "@/config/super-admins";

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
                let finalRole = existingProfile?.role || metadata.role || DEFAULT_ROLES.EMPLOYEE;

                // Verificar si el email es de un super admin autorizado
                const userEmail = user.email || '';
                const isMaster = isSuperAdminEmail(userEmail);

                if (isMaster) {
                    finalRole = DEFAULT_ROLES.SUPER_ADMIN;
                }

                let finalRoles = existingProfile?.roles || [finalRole];

                // Si es super_admin (por email o por DB), asegurar que tenga el array completo
                if (finalRole === DEFAULT_ROLES.SUPER_ADMIN || finalRoles.includes(DEFAULT_ROLES.SUPER_ADMIN) || isMaster) {
                    finalRole = DEFAULT_ROLES.SUPER_ADMIN;
                    if (!finalRoles.includes(DEFAULT_ROLES.SUPER_ADMIN) || !finalRoles.includes(DEFAULT_ROLES.COMPANY_ADMIN)) {
                        finalRoles = [...SUPER_ADMIN_FULL_ROLES];
                    }
                }

                const finalActiveRole = existingProfile?.active_role || finalRole;

                // Debug logging only in development
                if (process.env.NODE_ENV === 'development') {
                    console.log("[AUTH CALLBACK] Final Roles for user:", {
                        id: user.id,
                        email: user.email,
                        finalRole,
                        finalRoles
                    });
                }

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
