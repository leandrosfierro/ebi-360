import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkState() {
    const { data: companies } = await supabase.from('companies').select('id, name');
    console.log('Companies:', companies);

    const { data: surveys } = await supabase.from('surveys').select('id, name, code');
    console.log('Surveys:', surveys);

    const { data: assignments } = await supabase.from('company_surveys').select('*');
    console.log('Assignments:', assignments);
}

checkState();
