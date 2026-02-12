const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    console.log('Attempting to connect to:', supabaseUrl);

    // Try to fetch something simple. Even if the table doesn't exist yet, 
    // we want to see if the network request reaches Supabase.
    const { data, error } = await supabase.from('landing_pages').select('count', { count: 'exact', head: true });

    if (error) {
        if (error.code === '42P01') {
            console.log('✅ Connection Successful! (Note: Table "landing_pages" does not exist yet, which is expected before migration)');
        } else {
            console.error('❌ Connection Failed:', error.message);
        }
    } else {
        console.log('✅ Connection Successful! Tables already exist.');
    }
}

testConnection();
