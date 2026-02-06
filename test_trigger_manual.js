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

async function testTriggerLogic() {
    console.log(`\n--- TESTING TRIGGER LOGIC MANUALLY ---`);

    const sql = `
DO $$
DECLARE
    NEW record;
    role_to_set user_role;
    active_role_to_set user_role;
    initial_roles user_role[];
BEGIN
    -- Mocking NEW record from auth.users
    -- We can't actually use 'record' like this easily in an anonymous block for auth.users
    -- But we can just run the logic steps.
    
    role_to_set := 'employee'::user_role;
    active_role_to_set := 'employee'::user_role;
    initial_roles := ARRAY['employee'::user_role];
    
    INSERT INTO public.profiles (
        id, email, full_name, role, roles, active_role, admin_status
    )
    VALUES (
        '00000000-0000-0000-0000-000000000001',
        'trigger_test@check.com',
        'Trigger Test',
        role_to_set,
        initial_roles,
        active_role_to_set,
        'active'
    );
    
    RAISE NOTICE 'Insert successful';
    
    -- Cleanup
    DELETE FROM public.profiles WHERE id = '00000000-0000-0000-0000-000000000001';
EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Trigger Logic Failed: %', SQLERRM;
END $$;
`;

    // We can't run arbitrary SQL via the client easily unless there's an RPC.
    // Let's try to just do the insert via the client, which tests the DB constraints anyway.
    const { error } = await supabaseAdmin.from('profiles').insert({
        id: '00000000-0000-0000-0000-000000000001',
        email: 'trigger_test@check.com',
        full_name: 'Trigger Test',
        role: 'employee',
        roles: ['employee'],
        active_role: 'employee',
        admin_status: 'active'
    });

    if (error) {
        console.error('❌ Insert Error:', error.message);
    } else {
        console.log('✅ Insert Successful! (DB constraints are fine)');
        await supabaseAdmin.from('profiles').delete().eq('id', '00000000-0000-0000-0000-000000000001');
    }
}

testTriggerLogic();
