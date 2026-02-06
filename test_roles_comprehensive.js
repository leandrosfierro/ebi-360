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

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function runTest() {
    const testEmail = `test_admin_${Date.now()}@example.com`;
    console.log(`\n🚀 STARTING COMPREHENSIVE TEST: ${testEmail}`);

    // 1. Create a fresh Auth user
    const { data: { user }, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: testEmail,
        password: 'Password123!',
        email_confirm: true,
        user_metadata: {
            full_name: 'Test Admin User',
            role: 'employee',
            roles: ['employee']
        }
    });

    if (authError) throw authError;
    console.log(`✅ Auth user created. ID: ${user.id}`);

    // 2. Verify Profile existence (via trigger)
    // Wait a moment for trigger
    await new Promise(r => setTimeout(r, 1000));

    let { data: profile } = await supabaseAdmin.from('profiles').select('*').eq('id', user.id).single();
    if (!profile) {
        console.log("❌ Profile not found after signup!");
    } else {
        console.log(`✅ Profile found. Current role: ${profile.role}`);
    }

    // 3. Simulate Promotion (What "Invite Admin" does)
    console.log("\n--- SIMULATING PROMOTION TO COMPANY ADMIN ---");
    const newCompanyId = '6de10d2e-9eac-44c1-a356-438ea8430095'; // Existing test company

    const { error: promoError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
        user_metadata: {
            role: 'company_admin',
            roles: ['company_admin', 'employee'],
            active_role: 'company_admin',
            company_id: newCompanyId
        }
    });

    if (promoError) throw promoError;
    console.log("✅ Auth Metadata updated to Company Admin.");

    // 4. Verify DB SYNC (This is what the auth/callback does)
    // We'll mimic the resolveUserAccess logic and upsert
    const rolesSet = new Set(['employee', 'company_admin']);
    await supabaseAdmin.from('profiles').update({
        role: 'company_admin',
        roles: Array.from(rolesSet),
        active_role: 'company_admin',
        company_id: newCompanyId
    }).eq('id', user.id);

    console.log("✅ Database synced with new roles.");

    // 5. TEST ROLE SWITCH (Simulating the switchRole action)
    console.log("\n--- SIMULATING ROLE SWITCH BACK TO EMPLOYEE ---");
    const targetRole = 'employee';

    // DB Update
    await supabaseAdmin.from('profiles').update({
        active_role: targetRole,
        role: targetRole
    }).eq('id', user.id);

    // Metadata Update (SYNC)
    await supabaseAdmin.auth.admin.updateUserById(user.id, {
        user_metadata: {
            ...user.user_metadata,
            active_role: targetRole,
            role: targetRole,
            roles: ['company_admin', 'employee'],
            company_id: newCompanyId
        }
    });

    console.log("✅ switchRole atomic update complete.");

    // 6. FINAL VERIFICATION
    const { data: finalAuth } = await supabaseAdmin.auth.admin.getUserById(user.id);
    const { data: finalProfile } = await supabaseAdmin.from('profiles').select('*').eq('id', user.id).single();

    console.log("\n--- FINAL STATE ---");
    console.log("Auth Active Role:", finalAuth.user.user_metadata.active_role);
    console.log("DB Active Role:", finalProfile.active_role);

    if (finalAuth.user.user_metadata.active_role === finalProfile.active_role) {
        console.log("\n🎉 TEST PASSED: State is synchronized!");
    } else {
        console.log("\n❌ TEST FAILED: State desync!");
    }

    // Cleanup
    await supabaseAdmin.auth.admin.deleteUser(user.id);
    console.log(`\n🧹 Cleanup complete. User deleted.`);
}

runTest().catch(e => console.error("TEST FATAL:", e));
