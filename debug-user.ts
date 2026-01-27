
import { createAdminClient } from './src/lib/supabase/server';

async function checkUser(email: string) {
    const supabaseAdmin = createAdminClient();

    console.log(`\n--- DEBUGGING USER: ${email} ---`);

    // 1. Check Profile
    const { data: profile, error } = await supabaseAdmin
        .from('profiles')
        .select('*, company:companies(name)')
        .eq('email', email)
        .maybeSingle();

    if (error) {
        console.error('Error fetching profile:', error);
    } else if (profile) {
        console.log('✅ Profile found in Database:');
        console.log(JSON.stringify(profile, null, 2));
    } else {
        console.log('❌ Profile NOT found in Database.');
    }

    // 2. Check Auth Metadata
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    if (authError) {
        console.error('Error fetching auth users:', authError);
    } else {
        const user = authUsers.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
        if (user) {
            console.log('\n✅ Auth User found in Supabase Auth:');
            console.log(JSON.stringify({
                id: user.id,
                email: user.email,
                last_sign_in_at: user.last_sign_in_at,
                user_metadata: user.user_metadata,
                app_metadata: user.app_metadata
            }, null, 2));
        } else {
            console.log('\n❌ Auth User NOT found in Supabase Auth');
        }
    }
}

const emailToCheck = 'leandrosfierro@gmail.com';
checkUser(emailToCheck);
