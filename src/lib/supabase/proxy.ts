import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { isSuperAdminEmail } from '@/config/super-admins'

export async function updateSession(request: NextRequest) {
    try {
        let supabaseResponse = NextResponse.next({
            request,
        })

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseAnonKey) {
            console.error("Supabase environment variables are missing!");
            return supabaseResponse;
        }

        const supabase = createServerClient(
            supabaseUrl,
            supabaseAnonKey,
            {
                cookies: {
                    getAll() {
                        return request.cookies.getAll()
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            request.cookies.set(name, value)
                        )
                        supabaseResponse = NextResponse.next({
                            request,
                        })
                        cookiesToSet.forEach(({ name, value, options }) =>
                            supabaseResponse.cookies.set(name, value, options)
                        )
                    },
                },
            }
        )

        // Check auth user safely
        const { data, error: authError } = await supabase.auth.getUser()
        const user = data?.user

        // 1. Routes that REQUIRE authentication
        if (request.nextUrl.pathname.startsWith('/admin') || request.nextUrl.pathname.startsWith('/perfil') || request.nextUrl.pathname.startsWith('/diagnostico')) {
            if (!user) {
                const url = request.nextUrl.clone()
                url.pathname = '/login'
                url.searchParams.set('next', request.nextUrl.pathname)
                return NextResponse.redirect(url)
            }
        }

        // 2. Admin Routes - Role Check
        if (request.nextUrl.pathname.startsWith('/admin') && user) {
            let profile = null;
            try {
                // Fetch profile to check role - be very conservative with columns
                const { data: profileData, error: profileError } = await supabase
                    .from('profiles')
                    .select('role, roles, active_role')
                    .eq('id', user.id)
                    .maybeSingle();

                if (!profileError) {
                    profile = profileData;
                }
            } catch (e) {
                console.error("Middleware profile fetch conflict:", e);
            }

            // Determine effective role
            const userRoles = profile?.roles || [];
            const activeRole = profile?.active_role || profile?.role || 'employee';

            // SECURITY: Combine DB check with Hardcoded List for reliability
            const isMaster = user.email ? isSuperAdminEmail(user.email) : false;
            const isSuperAdmin = isMaster || activeRole === 'super_admin' || userRoles.includes('super_admin');

            // Super Admin area
            if (request.nextUrl.pathname.startsWith('/admin/super')) {
                if (!isSuperAdmin) {
                    const url = request.nextUrl.clone();
                    url.pathname = '/perfil';
                    return NextResponse.redirect(url);
                }
            }

            // Company Admin area
            if (request.nextUrl.pathname.startsWith('/admin/company')) {
                if (activeRole !== 'company_admin' && !isSuperAdmin) {
                    const url = request.nextUrl.clone();
                    url.pathname = '/perfil';
                    return NextResponse.redirect(url);
                }
            }
        }

        return supabaseResponse
    } catch (criticalError) {
        console.error("CRITICAL MIDDLEWARE ERROR:", criticalError);
        // Fallback to basic response instead of crashing the whole site
        return NextResponse.next({ request });
    }
}
