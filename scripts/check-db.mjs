import { createClient } from '@supabase/supabase-js';

async function checkStats() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.error('Missing Supabase environment variables');
        return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const tables = ['companies', 'profiles', 'results', 'areas', 'reports'];
    const stats = {};

    for (const table of tables) {
        try {
            const { count, error } = await supabase
                .from(table)
                .select('*', { count: 'exact', head: true });

            if (error) {
                console.error(`Error in ${table}:`, error.message);
                stats[table] = -1;
            } else {
                stats[table] = count || 0;
            }
        } catch (e) {
            console.error(`Exception in ${table}:`, e.message);
            stats[table] = -2;
        }
    }

    console.log('--- DATABASE STATS ---');
    console.log(JSON.stringify(stats, null, 2));

    try {
        const { data: masters, error: masterError } = await supabase
            .from('profiles')
            .select('email, role')
            .in('email', [
                'leandro.fierro@bs360.com.ar',
                'carlos.menvielle@bs360.com.ar',
                'carlitosmenvielle@gmail.com',
                'admin@bs360.com',
                'admin@bs360.com.ar',
                'soporte@bs360.com.ar'
            ]);

        if (masterError) {
            console.error('Master Profiles Error:', masterError.message);
        } else {
            console.log('--- MASTER PROFILES ---');
            console.log(JSON.stringify(masters, null, 2));
        }
    } catch (e) {
        console.error('Master Profiles Exception:', e.message);
    }
}

checkStats();
