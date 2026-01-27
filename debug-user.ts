
import { createAdminClient } from './src/lib/supabase/server';

async function checkUser(email: string) {
    const supabaseAdmin = createAdminClient();

    console.log(`Checking profile for: ${email}`);

    const { data: profile, error } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('email', email)
        .maybeSingle();

    if (error) {
        console.error('Error fetching profile:', error);
    } else {
        console.log('Profile found:', JSON.stringify(profile, null, 2));
    }

    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    if (authError) {
        console.error('Error fetching auth users:', authError);
    } else {
        const user = authUsers.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
        if (user) {
            console.log('Auth user found:', JSON.stringify({
                id: user.id,
                email: user.email,
                user_metadata: user.user_metadata,
                app_metadata: user.app_metadata
            }, null, 2));
        } else {
            console.log('Auth user NOT found');
        }
    }
}

const emailToCheck = 'leandrosfierro@gmail.com';
checkUser(emailToCheck);
