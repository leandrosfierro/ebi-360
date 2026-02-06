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

async function compareIds(email) {
    console.log(`\n--- ID COMPARISON FOR: ${email} ---`);

    // 1. Get Auth User
    const { data: authUsersResponse } = await supabaseAdmin.auth.admin.listUsers();
    const authUser = authUsersResponse.users.find(u => u.email?.toLowerCase() === email.toLowerCase());

    if (!authUser) {
        console.log('No Auth User found.');
        return;
    }

    console.log(`Auth User ID: ${authUser.id}`);

    // 2. Get Profile by Email
    const { data: profileByEmail, error: errorEmail } = await supabaseAdmin
        .from('profiles')
        .select('id, email, full_name')
        .eq('email', email)
        .maybeSingle();

    if (profileByEmail) {
        console.log(`Profile (by Email) ID: ${profileByEmail.id}`);
        console.log(`Match? ${authUser.id === profileByEmail.id ? 'YES' : 'NO'}`);
    } else {
        console.log('No profile found by Email.');
    }

    // 3. Get Profile by ID
    const { data: profileById, error: errorId } = await supabaseAdmin
        .from('profiles')
        .select('id, email, full_name')
        .eq('id', authUser.id)
        .maybeSingle();

    if (profileById) {
        console.log(`Profile (by ID) Email: ${profileById.email}`);
    } else {
        console.log('No profile found by ID.');
    }
}

compareIds('leandrosfierro@gmail.com');
