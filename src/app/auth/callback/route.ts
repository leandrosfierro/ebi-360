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
            let existingProfile: any = null;

            if (user) {
                const metadata = user.user_metadata || {};

                // Preservación y auto-reparación de roles (usando Admin Client)
                const { data: profile } = await supabaseAdmin
                    .from('profiles')
                    .select('role, roles, active_role, email, full_name, company_id, admin_status')
                    .eq('id', user.id)
                    .maybeSingle();

                existingProfile = profile;

                // Prioridad de rol: Perfil existente -> Metadata de Auth -> Default
                let finalRole = existingProfile?.role || metadata.role || DEFAULT_ROLES.EMPLOYEE;
                const userEmail = user.email || '';
                const isMaster = isSuperAdminEmail(userEmail);

                if (isMaster) {
                    finalRole = DEFAULT_ROLES.SUPER_ADMIN;
                }

                // MERGE roles instead of replacing
                let finalRoles = existingProfile?.roles || [finalRole];
                if (!finalRoles.includes(finalRole as any)) {
                    finalRoles.push(finalRole as any);
                }

                // Si es super_admin (por email o por DB), asegurar que tenga el array completo
                if (finalRole === DEFAULT_ROLES.SUPER_ADMIN || finalRoles.includes(DEFAULT_ROLES.SUPER_ADMIN as any) || isMaster) {
                    finalRole = DEFAULT_ROLES.SUPER_ADMIN;
                    // Ensure all master roles are present
                    SUPER_ADMIN_FULL_ROLES.forEach(r => {
                        if (!finalRoles.includes(r as any)) finalRoles.push(r as any);
                    });
                } else if (finalRole === DEFAULT_ROLES.COMPANY_ADMIN || finalRoles.includes(DEFAULT_ROLES.COMPANY_ADMIN as any)) {
                    // Ensure company admins also have employee role for self-testing
                    if (!finalRoles.includes(DEFAULT_ROLES.EMPLOYEE as any)) {
                        finalRoles.push(DEFAULT_ROLES.EMPLOYEE as any);
                    }
                }

                // Logic for company identity preservation
                const finalCompanyId = metadata.company_id || existingProfile?.company_id || null;

                // FORCE active_role upgrade if they have a more powerful role now
                let finalActiveRole = existingProfile?.active_role || finalRole;

                if (finalRole === DEFAULT_ROLES.SUPER_ADMIN) {
                    finalActiveRole = DEFAULT_ROLES.SUPER_ADMIN;
                } else if (finalRole === DEFAULT_ROLES.COMPANY_ADMIN && finalActiveRole === DEFAULT_ROLES.EMPLOYEE) {
                    finalActiveRole = DEFAULT_ROLES.COMPANY_ADMIN;
                }

                if (isMaster) finalActiveRole = DEFAULT_ROLES.SUPER_ADMIN;

                // Set the role for redirection
                activeRoleForRedirect = finalActiveRole;

                // Upsert using Admin Client with merged data
                await supabaseAdmin
                    .from('profiles')
                    .upsert({
                        id: user.id,
                        email: user.email!,
                        full_name: metadata.full_name || metadata.name || existingProfile?.full_name || '',
                        role: finalRole,
                        active_role: finalActiveRole,
                        roles: finalRoles,
                        company_id: finalCompanyId,
                        admin_status: existingProfile?.admin_status || 'active',
                        last_active_at: new Date().toISOString()
                    }, {
                        onConflict: 'id'
                    });
            }

            // Robust redirect based on role
            let targetPath = next;

            if (next === '/' || next === '/perfil') {
                // If user is still 'invited', force them to set a password
                if (existingProfile?.admin_status === 'invited') {
                    targetPath = '/auth/setup-password';
                } else if (activeRoleForRedirect === 'super_admin') {
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
