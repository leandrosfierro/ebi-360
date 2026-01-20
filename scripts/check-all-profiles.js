
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function main() {
    try {
        const envFile = fs.readFileSync(path.join(process.cwd(), '.env.local'), 'utf8');
        const getEnv = (key) => {
            const match = envFile.match(new RegExp(`${key}=(.*)`));
            return match ? match[1].trim() : null;
        };

        const url = getEnv('NEXT_PUBLIC_SUPABASE_URL');
        const anonKey = getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');
        const serviceKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');

        const key = serviceKey || anonKey;

        if (!url || !key) {
            console.log('Could not find Supabase credentials');
            return;
        }

        console.log(`Using URL: ${url}`);
        console.log(`Using Key Type: ${serviceKey ? 'SERVICE_ROLE' : 'ANON'}`);

        const supabase = createClient(url, key);

        console.log("\n--- BUSCANDO PERFILES ADMINISTRATIVOS ---");
        const { data: profiles, error } = await supabase
            .from('profiles')
            .select('id, email, role, roles, active_role, full_name')
            .limit(100);

        if (error) {
            console.error('Error fetching profiles:', error);
            return;
        }

        const admins = profiles.filter(p => 
            p.role !== 'employee' || 
            (p.roles && p.roles.includes('super_admin')) ||
            (p.roles && p.roles.includes('company_admin'))
        );

        if (admins.length > 0) {
            console.log(`Se encontraron ${admins.length} perfiles con privilegios:`);
            admins.forEach(p => {
                console.log(`- [${p.id.slice(0,5)}] ${p.email}:`);
                console.log(`    Role: ${p.role}`);
                console.log(`    Active: ${p.active_role}`);
                console.log(`    Roles: ${JSON.stringify(p.roles)}`);
                console.log(`    Nombre: ${p.full_name}`);
            });
        } else {
            console.log("No se encontraron administradores explícitos.");
            console.log("Mostrando todos los perfiles encontrados:");
            profiles.forEach(p => {
                console.log(`- ${p.email}: ${p.role}`);
            });
        }

    } catch (err) {
        console.error('Script error:', err);
    }
}

main();
