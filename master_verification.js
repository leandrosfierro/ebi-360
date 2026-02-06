const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// 1. Setup Environment
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

if (!supabaseUrl || !supabaseServiceKey || supabaseServiceKey.endsWith('1234567890')) {
    console.error("❌ FATAL: SUPABASE_SERVICE_ROLE_KEY is invalid or missing.");
    process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

async function runMasterVerification() {
    console.log(`\n🚀 STARTING MASTER VERIFICATION: ROBUST ROLE SYSTEM`);
    console.log(`====================================================`);

    const testEmail = `verify_robust_${Date.now()}@example.com`;
    let testUserId = null;

    try {
        // --- STEP 1: VERIFY MASTER ADMIN (Existing) ---
        console.log(`\n[Step 1] Verifying Master Admin (leandrosfierro@gmail.com)...`);
        const { data: { users: allUsers } } = await supabaseAdmin.auth.admin.listUsers();
        const masterAuth = allUsers.find(u => u.email?.toLowerCase() === 'leandrosfierro@gmail.com');

        if (masterAuth) {
            console.log(`✅ Master Auth found. ID: ${masterAuth.id}`);
            const { data: masterProfile } = await supabaseAdmin.from('profiles').select('*').eq('id', masterAuth.id).single();
            if (masterProfile?.roles?.includes('super_admin')) {
                console.log(`✅ Master Profile has 'super_admin' in roles array.`);
            } else {
                console.log(`⚠️ Master Profile MISSING 'super_admin' in DB. (Will be fixed by migration)`);
            }
        } else {
            console.log(`ℹ️ Master Admin not found in this environment (likely production only).`);
        }

        // --- STEP 2: SIMULATE NEW USER CREATION & TRIGGER ---
        console.log(`\n[Step 2] Simulating New User Creation (Trigger Test)...`);
        const { data: { user: newUser }, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email: testEmail,
            password: 'TestPassword123!',
            email_confirm: true,
            user_metadata: {
                full_name: 'Robust Tester',
                company_id: '6de10d2e-9eac-44c1-a356-438ea8430095', // Use Bs360 ID
                role: 'employee',
                roles: ['employee'],
                active_role: 'employee'
            }
        });

        if (createError) throw createError;
        testUserId = newUser.id;
        console.log(`✅ User Created. Auth ID: ${testUserId}`);

        // Wait for trigger
        await new Promise(r => setTimeout(r, 2000));

        const { data: newProfile } = await supabaseAdmin.from('profiles').select('*').eq('id', testUserId).single();
        if (newProfile) {
            console.log(`✅ Profile created via trigger.`);
            console.log(`   Email: ${newProfile.email}`);
            console.log(`   Roles: ${JSON.stringify(newProfile.roles)}`);
            console.log(`   Company: ${newProfile.company_id}`);
        } else {
            console.log(`❌ Profile NOT found! Trigger failed or slow.`);
        }

        // --- STEP 3: SIMULATE PROMOTION (ATOMIC) ---
        console.log(`\n[Step 3] Simulating Atomic Promotion to Company Admin...`);

        // This mimics our new robust pattern
        const newRoles = ['company_admin', 'employee'];

        // 1. Update DB
        await supabaseAdmin.from('profiles').update({
            role: 'company_admin',
            roles: newRoles,
            active_role: 'company_admin'
        }).eq('id', testUserId);

        // 2. Update Auth Metadata
        await supabaseAdmin.auth.admin.updateUserById(testUserId, {
            user_metadata: {
                ...newUser.user_metadata,
                role: 'company_admin',
                roles: newRoles,
                active_role: 'company_admin'
            }
        });

        console.log(`✅ Atomic Update complete.`);

        // Verification of Step 3
        const { data: verifyAuth } = await supabaseAdmin.auth.admin.getUserById(testUserId);
        const { data: verifyProfile } = await supabaseAdmin.from('profiles').select('*').eq('id', testUserId).single();

        const syncSuccess =
            verifyAuth.user.user_metadata.active_role === 'company_admin' &&
            verifyProfile.active_role === 'company_admin';

        if (syncSuccess) {
            console.log(`✅ SUCCESS: Auth and DB are perfectly synchronized!`);
        } else {
            console.log(`❌ FAILURE: Desync detected between Auth and DB.`);
            console.log(`   Auth: ${verifyAuth.user.user_metadata.active_role}`);
            console.log(`   DB  : ${verifyProfile.active_role}`);
        }

        // --- STEP 4: SIMULATE ROLE SWITCH back to employee ---
        console.log(`\n[Step 4] Simulating switchRole call (Back to Employee)...`);

        // Update DB
        await supabaseAdmin.from('profiles').update({
            active_role: 'employee',
            role: 'employee'
        }).eq('id', testUserId);

        // Sync Metadata
        await supabaseAdmin.auth.admin.updateUserById(testUserId, {
            user_metadata: {
                ...verifyAuth.user.user_metadata,
                active_role: 'employee',
                role: 'employee'
            }
        });

        const { data: finalAuth } = await supabaseAdmin.auth.admin.getUserById(testUserId);
        if (finalAuth.user.user_metadata.active_role === 'employee') {
            console.log(`✅ SUCCESS: Role switch synchronized.`);
        } else {
            console.log(`❌ FAILURE: Role switch desync.`);
        }

    } catch (err) {
        console.error(`\n❌ MASTER VERIFICATION ABORTED:`, err.message);
    } finally {
        if (testUserId) {
            console.log(`\n🧹 Cleaning up test user ${testUserId}...`);
            await supabaseAdmin.auth.admin.deleteUser(testUserId);
            console.log(`✅ Cleanup done.`);
        }
    }

    console.log(`\n====================================================`);
    console.log(`🚀 VERIFICATION COMPLETE`);
}

runMasterVerification();
