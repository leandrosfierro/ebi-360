
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function main() {
    try {
        // 1. Get credentials
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

        const email = 'leandro.fierro@bs360.com.ar';

        // 2. Fetch user
        const { data: profiles, error: fetchError } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', email);

        if (fetchError || profiles.length === 0) {
            console.error('Error fetching profile or user not found:', fetchError);
            return;
        }

        const user = profiles[0];
        console.log('Current permissions:', { role: user.role, roles: user.roles });

        // 3. Update permissions
        const updates = {
            role: 'super_admin',
            roles: ['super_admin', 'company_admin', 'employee'], // Grant all roles
            active_role: 'super_admin'
        };

        const { data: updated, error: updateError } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', user.id)
            .select();

        if (updateError) {
            console.error('Error updating permissions:', updateError);
        } else {
            console.log('Successfully updated permissions:', JSON.stringify(updated[0], null, 2));
        }

    } catch (err) {
        console.error('Script error:', err);
    }
}

main();
