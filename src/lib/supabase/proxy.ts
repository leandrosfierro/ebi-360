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
            .select('active_role, role')
            .eq('id', user.id)
            .single()

        // If we can't read profile, something is wrong, allow safe fail or redirect?
        // Let's assume if no profile, they are just an employee/user
        const activeRole = profile?.active_role || profile?.role || 'employee'

        // Super Admin area
        if (request.nextUrl.pathname.startsWith('/admin/super')) {
            if (activeRole !== 'super_admin') {
                return NextResponse.redirect(new URL('/perfil', request.url))
            }
        }

        // Company Admin area
        if (request.nextUrl.pathname.startsWith('/admin/company')) {
            if (activeRole !== 'company_admin' && activeRole !== 'super_admin') {
                return NextResponse.redirect(new URL('/perfil', request.url))
            }
        }
    }

    return supabaseResponse
}
