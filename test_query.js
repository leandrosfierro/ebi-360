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
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testFrontendQuery(userId) {
    console.log(`\n--- TESTING FRONTEND QUERY FOR USER ID: ${userId} ---`);

    const { data: profile, error } = await supabase
        .from("profiles")
        .select(`
            full_name, 
            role, 
            roles, 
            active_role,
            company:companies(id, name)
        `)
        .eq("id", userId)
        .maybeSingle();

    if (error) {
        console.error('❌ QUERY ERROR:', error);
    } else if (profile) {
        console.log('✅ PROFILE FOUND:');
        console.log(JSON.stringify(profile, null, 2));
    } else {
        console.log('❌ PROFILE NOT FOUND (Empty result)');
    }
}

const userIdToCheck = 'c46e63ba-60bd-44d1-893c-a26f22417a41';
testFrontendQuery(userIdToCheck);
