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

            const forwardedHost = request.headers.get("x-forwarded-host"); // original origin before load balancer
            const isLocalEnv = process.env.NODE_ENV === "development";
            if (isLocalEnv) {
                // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
                return NextResponse.redirect(`${origin}${next}`);
            } else if (forwardedHost) {
                return NextResponse.redirect(`https://${forwardedHost}${next}`);
            } else {
                return NextResponse.redirect(`${origin}${next}`);
            }
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
