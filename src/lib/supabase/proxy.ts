import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
            url.pathname = '/login' // Make sure this route exists or matches your auth entry
            url.searchParams.set('next', request.nextUrl.pathname)
            return NextResponse.redirect(url)
        }
    }

    // 2. Admin Routes - Role Check
    if (request.nextUrl.pathname.startsWith('/admin') && user) {
        let profile = null;
        try {
            // Fetch profile to check role - be very conservative with columns
            const { data } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .maybeSingle();
            profile = data;
        } catch (e) {
            console.error("Middleware profile fetch error:", e);
        }

        const role = profile?.role || 'employee';
        const isSuperAdmin = role === 'super_admin';

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
            if (role !== 'company_admin' && !isSuperAdmin) {
                const url = request.nextUrl.clone();
                url.pathname = '/perfil';
                return NextResponse.redirect(url);
            }
        }
    }

    return supabaseResponse
}
