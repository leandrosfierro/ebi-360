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

async function dumpProfile(email) {
    console.log(`\n--- DUMPING PROFILE FOR: ${email} ---`);

    const { data: profiles, error } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('email', email);

    if (error) {
        console.error('Error:', error);
    } else {
        console.log(`Found ${profiles.length} records:`);
        console.log(JSON.stringify(profiles, null, 2));
    }

    // Also check Auth Users to match IDs
    const { data: authUsersResponse } = await supabaseAdmin.auth.admin.listUsers();
    const authUser = authUsersResponse.users.find(u => u.email?.toLowerCase() === email.toLowerCase());

    if (authUser) {
        console.log('\n--- AUTH USER MATCH ---');
        console.log('ID:', authUser.id);
        console.log('Metadata:', JSON.stringify(authUser.user_metadata, null, 2));
    } else {
        console.log('\n--- NO AUTH USER FOUND ---');
    }
}

dumpProfile('leandrosfierro@gmail.com');
