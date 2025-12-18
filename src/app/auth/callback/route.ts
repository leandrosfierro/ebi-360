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

                // Check if profile already exists to preserve roles
                const { data: existingProfile } = await supabase
                    .from('profiles')
                    .select('full_name, role, roles, active_role, company_id')
                    .eq('id', user.id)
                    .single();

                // Determine final values, favoring existing ones if the new ones are defaults
                const finalRole = existingProfile?.role || metadata.role || 'employee';
                const finalActiveRole = existingProfile?.active_role || metadata.active_role || finalRole;

                let finalRolesArray = existingProfile?.roles || [finalRole];
                if (finalRole === 'super_admin' && !finalRolesArray.includes('company_admin')) {
                    finalRolesArray = ['super_admin', 'company_admin'];
                }

                // UPSERT profile - create if doesn't exist, update if exists (preserving roles)
                await supabase
                    .from('profiles')
                    .upsert({
                        id: user.id,
                        email: user.email!,
                        full_name: metadata.full_name || metadata.name || existingProfile?.full_name || '',
                        role: finalRole,
                        active_role: finalActiveRole,
                        roles: finalRolesArray,
                        company_id: metadata.company_id || existingProfile?.company_id || null,
                        admin_status: 'active',
                        last_active_at: new Date().toISOString()
                    }, {
                        onConflict: 'id',
                        ignoreDuplicates: false
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
