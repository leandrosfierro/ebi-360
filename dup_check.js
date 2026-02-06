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

async function findDuplicates(email) {
    console.log(`\n--- DUP CHECK FOR: ${email} ---`);

    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();

    const matches = users.filter(u => u.email?.toLowerCase() === email.toLowerCase());

    console.log(`Found ${matches.length} users in Auth:`);
    matches.forEach(u => {
        console.log(`- ID: ${u.id}, Created: ${u.created_at}, Provider: ${u.app_metadata.provider}`);
    });
}

findDuplicates('leandrosfierro@gmail.com');
