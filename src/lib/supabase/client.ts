import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            auth: {
                persistSession: true,
                storageKey: 'ebi-auth-v1',
                storage: {
                    getItem: (key) => {
                        if (typeof window === 'undefined') return null;
                        return localStorage.getItem(key) || document.cookie.split('; ').find(row => row.startsWith(`${key}=`))?.split('=')[1] || null;
                    },
                    setItem: (key, value) => {
                        if (typeof window === 'undefined') return;
                        localStorage.setItem(key, value);
                        // Also set a long-lived cookie for the server
                        document.cookie = `${key}=${value}; path=/; max-age=31536000; SameSite=Lax; Secure`;
                    },
                    removeItem: (key) => {
                        if (typeof window === 'undefined') return;
                        localStorage.removeItem(key);
                        document.cookie = `${key}=; path=/; max-age=0`;
                    },
                },
                flowType: 'pkce',
                detectSessionInUrl: true,
                autoRefreshToken: true
            }
        }
    )
}
