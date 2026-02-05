import { createClient, createAdminClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { resolveUserAccess } from "@/lib/auth-utils";

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    const next = searchParams.get("next") ?? "/";

    if (code) {
        const supabase = await createClient();
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

        if (!exchangeError) {
            const supabaseAdmin = createAdminClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const metadata = user.user_metadata || {};

                // Get existing profile via Admin Client (bypass RLS)
                const { data: dbProfile } = await supabaseAdmin
                    .from('profiles')
                    .select('role, roles, active_role, email, full_name, company_id, admin_status')
                    .eq('id', user.id)
                    .maybeSingle();

                // 🦅 CENTRALIZED ACCESS RESOLUTION
                console.log(`[Auth Callback] Resolving access for: ${user.email}`);
                const access = resolveUserAccess(user.email!, metadata, dbProfile);
                console.log(`[Auth Callback] Resolved Access:`, access);

                // 2. Determine redirection and status
                let adminStatus = dbProfile?.admin_status || metadata.admin_status || 'active';

                // If they were invited but we see they are logging in now, 
                // we might want to keep 'invited' until they set password, 
                // but the setup-password page handles the transition.

                // Upsert cleaned up profile
                const { error: upsertError } = await supabaseAdmin
                    .from('profiles')
                    .upsert({
                        id: user.id,
                        email: user.email!,
                        full_name: metadata.full_name || metadata.name || dbProfile?.full_name || '',
                        role: access.role,
                        active_role: access.active_role,
                        roles: access.roles,
                        company_id: access.company_id,
                        admin_status: adminStatus,
                        last_active_at: new Date().toISOString()
                    }, {
                        onConflict: 'id'
                    });

                if (upsertError) {
                    console.error("[Auth Callback] Profile Sync Error:", upsertError);
                } else {
                    console.log(`[Auth Callback] Profile successfully synced for: ${user.email}`);
                }


                // Robust redirect based on role
                let targetPath = next;

                if (next === '/' || next === '/perfil' || next === '/admin/company' || next === '/admin/super') {
                    if (adminStatus === 'invited') {
                        targetPath = '/auth/setup-password';
                    } else if (access.active_role === 'super_admin') {
                        targetPath = '/admin/super';
                    } else if (access.active_role === 'company_admin') {
                        targetPath = '/admin/company';
                    } else {
                        targetPath = '/perfil';
                    }
                }

                return NextResponse.redirect(new URL(targetPath, request.url));
            }
        }
    }

    // fallback to login with error
    const errorUrl = new URL('/login', request.url);
    errorUrl.searchParams.set('error', 'auth_failed');
    return NextResponse.redirect(errorUrl);
}
