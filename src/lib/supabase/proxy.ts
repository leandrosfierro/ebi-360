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

    // Check auth user
    const {
        data: { user },
    } = await supabase.auth.getUser()

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
        // Fetch profile to check role
        const { data: profile } = await supabase
            .from('profiles')
            .select('active_role, role, roles')
            .eq('id', user.id)
            .single()

        const activeRole = profile?.active_role || profile?.role || 'employee'
        // Universal Pass: If user has 'super_admin' in their roles list, let them pass ANY admin check
        const isSuperAdmin = profile?.roles?.includes('super_admin') || profile?.role === 'super_admin';

        // Super Admin area
        if (request.nextUrl.pathname.startsWith('/admin/super')) {
            if (activeRole !== 'super_admin' && !isSuperAdmin) {
                return NextResponse.redirect(new URL('/perfil', request.url))
            }
        }

        // Company Admin area
        if (request.nextUrl.pathname.startsWith('/admin/company')) {
            // Allow if active_role is company_admin OR if they are a super_admin (even if acting as company_admin)
            if (activeRole !== 'company_admin' && activeRole !== 'super_admin' && !isSuperAdmin) {
                return NextResponse.redirect(new URL('/perfil', request.url))
            }
        }
    }

    return supabaseResponse
}
