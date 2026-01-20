import { createClient, createAdminClient } from "@/lib/supabase/server";
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
            let activeRoleForRedirect = 'employee';

            // Use Admin Client for database operations to bypass RLS
            // This is critical to ensure we can read/write the profile correctly during login
            const supabaseAdmin = createAdminClient();

            // Get user and create/update profile
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const metadata = user.user_metadata || {};

                // Preservación y auto-reparación de roles (usando Admin Client)
                const { data: existingProfile } = await supabaseAdmin
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
                    finalRoles = [...SUPER_ADMIN_FULL_ROLES];
                } else if (finalRole === DEFAULT_ROLES.COMPANY_ADMIN || finalRoles.includes(DEFAULT_ROLES.COMPANY_ADMIN)) {
                    // Ensure company admins also have employee role
                    if (!finalRoles.includes(DEFAULT_ROLES.EMPLOYEE)) {
                        finalRoles = [DEFAULT_ROLES.COMPANY_ADMIN, DEFAULT_ROLES.EMPLOYEE];
                    }
                }

                const finalActiveRole = existingProfile?.active_role || finalRole;

                // Set the role for redirection
                activeRoleForRedirect = finalActiveRole;

                // Upsert using Admin Client
                await supabaseAdmin
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

            // Robust redirect based on role
            let targetPath = next;

            if (next === '/' || next === '/perfil') {
                if (activeRoleForRedirect === 'super_admin') {
                    targetPath = '/admin/super';
                } else if (activeRoleForRedirect === 'company_admin') {
                    targetPath = '/admin/company';
                } else {
                    targetPath = '/perfil';
                }
            }

            const redirectUrl = new URL(targetPath, request.url);
            return NextResponse.redirect(redirectUrl);
        }
    }

    // fallback to login with error param instead of non-existent page
    const errorUrl = new URL('/login', request.url);
    errorUrl.searchParams.set('error', 'auth_failed');
    return NextResponse.redirect(errorUrl);
}
