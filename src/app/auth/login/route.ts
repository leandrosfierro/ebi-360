import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function POST(request: Request) {
    const supabase = await createClient()
    const { origin } = new URL(request.url)

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${origin}/auth/callback`,
        },
    })

    if (error) {
        console.error('Error signing in with Google:', error)
        // Redirect to a route that actually exists on error
        redirect('/login?error=auth_init_failed')
    }

    if (data.url) {
        redirect(data.url) // Redirect to Google OAuth
    }
}
