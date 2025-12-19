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

                // Preservación robusta de roles
                const { data: existingProfile } = await supabase
                    .from('profiles')
                    .select('role, roles, active_role')
                    .eq('id', user.id)
                    .maybeSingle();

                const finalRole = existingProfile?.role || metadata.role || 'employee';
                const finalActiveRole = existingProfile?.active_role || finalRole;
                let finalRoles = existingProfile?.roles || [finalRole];

                // Auto-fix for Super Admins
                if (finalRole === 'super_admin' && !finalRoles.includes('company_admin')) {
                    finalRoles = ['super_admin', 'company_admin', 'employee'];
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
