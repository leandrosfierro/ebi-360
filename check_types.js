const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Basic env loader
const envContent = fs.readFileSync(path.resolve(__dirname, '.env.local'), 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, ...value] = line.split('=');
    if (key && value) {
        env[key.trim()] = value.join('=').trim();
    }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function checkTypes() {
    console.log(`\n--- CHECKING DB TYPES ---`);

    // Use RPC to get enum values if possible, or just query pg_type
    const { data: enumValues, error } = await supabaseAdmin
        .rpc('get_enum_values', { enum_name: 'user_role' });

    if (error) {
        console.log("RPC get_enum_values not found. Trying pg_type...");

        // We can't query pg_type directly via postgrest usually.
        // Let's try to insert a profile with a known role and see if it fails.
        const { error: insertError } = await supabaseAdmin
            .from('profiles')
            .insert({
                id: '00000000-0000-0000-0000-000000000000',
                email: 'test@check.com',
                role: 'super_admin'
            });

        if (insertError) {
            console.log("Test insert failed:", insertError.message);
        } else {
            console.log("Test insert with 'super_admin' succeeded.");
            await supabaseAdmin.from('profiles').delete().eq('id', '00000000-0000-0000-0000-000000000000');
        }
    } else {
        console.log("user_role enum values:", enumValues);
    }
}

checkTypes();
