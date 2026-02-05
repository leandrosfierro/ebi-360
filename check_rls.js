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

async function checkPolicies() {
    console.log(`\n--- CHECKING RLS POLICIES ---`);

    const { data: policies, error } = await supabaseAdmin
        .rpc('get_policies'); // This might not exist, alternative:

    const { data: pgPolicies, error: pgError } = await supabaseAdmin
        .from('pg_policies') // This is usually not directly selectable unless enabled
        .select('*');

    if (pgError) {
        // Fallback: simple SQL query via rpc if we have one, or just try to insert a test policy
        console.log("pg_policies not directly accessible. Trying a different way...");

        // Let's try to just select from profiles with current authenticated role simulation
        // Actually, the most robust way is to just provide the SQL fix.
    } else {
        console.log(JSON.stringify(pgPolicies, null, 2));
    }
}

checkPolicies();
