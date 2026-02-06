const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

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

async function auditDataIntegrity() {
    console.log(`\n--- DATA INTEGRITY AUDIT ---`);
    console.log(`============================`);

    // 1. Audit Orphans in 'results'
    console.log(`\n[Audit 1] Checking for results without profiles...`);
    const { data: results, error: resultsError } = await supabaseAdmin.from('results').select('id, user_id');
    const { data: profiles, error: profilesError } = await supabaseAdmin.from('profiles').select('id');

    const profileIds = new Set(profiles.map(p => p.id));
    const orphanResults = results.filter(r => !profileIds.has(r.user_id));

    if (orphanResults.length > 0) {
        console.log(`❌ Found ${orphanResults.length} orphan results (user_id not in profiles).`);
        console.log(orphanResults.map(o => o.id));
    } else {
        console.log(`✅ No orphan results found.`);
    }

    // 2. Audit Orphans in 'survey_responses'
    console.log(`\n[Audit 2] Checking for responses without results...`);
    const { data: responses, error: respError } = await supabaseAdmin.from('survey_responses').select('id, result_id');
    const resultIds = new Set(results.map(r => r.id));
    const orphanResponses = responses.filter(r => !resultIds.has(r.result_id));

    if (orphanResponses.length > 0) {
        console.log(`❌ Found ${orphanResponses.length} orphan responses.`);
    } else {
        console.log(`✅ No orphan responses found.`);
    }

    // 3. Check for users in auth.users missing in public.profiles
    console.log(`\n[Audit 3] Checking for Auth users without public profiles...`);
    const { data: { users }, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    const authIds = new Set(users.map(u => u.id));
    const missingProfiles = users.filter(u => !profileIds.has(u.id));

    if (missingProfiles.length > 0) {
        console.log(`⚠️ Found ${missingProfiles.length} Auth users without profiles.`);
        missingProfiles.forEach(u => console.log(`   - ${u.email} (${u.id})`));
    } else {
        console.log(`✅ All Auth users have profiles.`);
    }

    // 4. Check for profiles in public.profiles missing in auth.users (Deletions desync)
    console.log(`\n[Audit 4] Checking for profiles without Auth users...`);
    const orphanProfiles = profiles.filter(p => !authIds.has(p.id));
    if (orphanProfiles.length > 0) {
        console.log(`⚠️ Found ${orphanProfiles.length} profiles without corresponding Auth user.`);
    } else {
        console.log(`✅ All profiles have corresponding Auth users.`);
    }

    console.log(`\n============================`);
    console.log(`AUDIT COMPLETE`);
}

auditDataIntegrity();
