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

    // IMPORTANT: Avoid writing any logic between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.

    const {
        data: { user },
    } = await supabase.auth.getUser()

    // Protected routes logic
    if (request.nextUrl.pathname.startsWith('/admin')) {
        // 1. Check if user is authenticated
        if (!user) {
            const url = request.nextUrl.clone()
            url.pathname = '/login'
            url.searchParams.set('next', request.nextUrl.pathname)
            return NextResponse.redirect(url)
        }

        // 2. Check user role
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        const role = profile?.role

        // Super Admin protection
        if (request.nextUrl.pathname.startsWith('/admin/super')) {
            if (role !== 'super_admin') {
                // Redirect unauthorized users to their appropriate dashboard or home
                const url = request.nextUrl.clone()
                if (role === 'company_admin') {
                    url.pathname = '/admin/company'
                } else {
                    url.pathname = '/'
                }
                return NextResponse.redirect(url)
            }
        }

        // Company Admin protection
        if (request.nextUrl.pathname.startsWith('/admin/company')) {
            if (role !== 'company_admin' && role !== 'super_admin') {
                const url = request.nextUrl.clone()
                url.pathname = '/'
                return NextResponse.redirect(url)
            }
        }
    } else if (
        !user &&
        !request.nextUrl.pathname.startsWith('/login') &&
        !request.nextUrl.pathname.startsWith('/auth') &&
        !request.nextUrl.pathname.startsWith('/') // Allow landing page
    ) {
        // Optional: Protect other routes if needed, but for now we allow public access to home
        // If you want to protect /diagnostico or /perfil, add them here
        if (request.nextUrl.pathname.startsWith('/perfil')) {
            const url = request.nextUrl.clone()
            url.pathname = '/login'
            url.searchParams.set('next', request.nextUrl.pathname)
            return NextResponse.redirect(url)
        }
    }

    return supabaseResponse
}
