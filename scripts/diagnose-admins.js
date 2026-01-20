
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Cargar variables de entorno
dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Error: Faltan variables de entorno (URL o SERVICE_ROLE_KEY)");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function diagnoseAdmins() {
    console.log("--- DIAGNÓSTICO DE ADMINISTRADORES ---");
    
    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, email, role, roles, active_role')
        .or('role.eq.super_admin,role.eq.company_admin,roles.cs.{"super_admin"}');

    if (error) {
        console.error("Error al consultar perfiles:", error);
        return;
    }

    if (!profiles || profiles.length === 0) {
        console.log("No se encontraron perfiles con roles administrativos en la base de datos.");
        
        // Listar los últimos 5 usuarios para ver qué hay
        const { data: lastUsers } = await supabase
            .from('profiles')
            .select('email, role, roles')
            .limit(5);
        console.log("Últimos 5 usuarios registrados:", lastUsers);
    } else {
        console.log(`Se encontraron ${profiles.length} administradores:`);
        profiles.forEach(p => {
            console.log(`- ${p.email}: Role=${p.role}, Active=${p.active_role}, Roles=[${p.roles}]`);
        });
    }
}

diagnoseAdmins();
