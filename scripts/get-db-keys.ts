
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function main() {
    console.log('Fetching module settings...');
    const { data, error } = await supabase.from('module_settings').select('*');
    if (error) {
        console.error('Error:', error);
        return;
    }
    console.log('Modules found:', data.map(m => m.module_name));
    data.forEach(m => {
        if (m.metadata) {
            console.log(`\nModule: ${m.module_name}`);
            console.log('Metadata:', JSON.stringify(m.metadata, null, 2));
        }
    });
}

main();
