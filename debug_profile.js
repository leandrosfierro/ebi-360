
const { createClient } = require('@supabase/supabase-js');

// Helper to load env vars from .env.local file if present
// We'll just assume they are available in the environment or we can extract them
// Since I can't easily load .env.local in a node script without dotenv, I'll rely on the user having them set or I'll read the file directly to find them if this fails, but usually run_command shares env? No, it might not.

// Let's try to read .env.local first to get the credentials
const fs = require('fs');
const path = require('path');

async function main() {
    try {
        const envFile = fs.readFileSync(path.join(process.cwd(), '.env.local'), 'utf8');
        const getEnv = (key) => {
            const match = envFile.match(new RegExp(`${key}=(.*)`));
            return match ? match[1] : null;
        };

        const url = getEnv('NEXT_PUBLIC_SUPABASE_URL');
        const key = getEnv('SUPABASE_SERVICE_ROLE_KEY') || getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');

        if (!url || !key) {
            console.log('Could not find Supabase credentials');
            return;
        }

        const supabase = createClient(url, key);

        // Fetch user by email (we need to find the user ID first, or just search profiles by email if that column is unique/indexed)
        // Profiles usually has user_id as PK, but let's see if we can search by email if it's there.
        // The code in page.tsx selects 'full_name, role, roles' from profiles.
        // It assumes a relation to auth.users usually, but profiles table often has an email column too for convenience as seen in updateProfile action.

        const { data: profiles, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', 'leandro.fierro@bs360.com.ar');

        if (error) {
            console.error('Error fetching profile:', error);
        } else {
            console.log('Profile Data:', JSON.stringify(profiles, null, 2));
        }

    } catch (err) {
        console.error('Script error:', err);
    }
}

main();
