const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

const testUsers = [
    { email: 'customer1@indoai.web.id', name: 'Customer One' },
    { email: 'customer2@indoai.web.id', name: 'Customer Two' },
    { email: 'customer3@indoai.web.id', name: 'Customer Three' },
    { email: 'customer4@indoai.web.id', name: 'Customer Four' },
    { email: 'customer5@indoai.web.id', name: 'Customer Five' }
];

const COMMON_PASSWORD = 'member123';

async function createAccounts() {
    console.log('--- 👤 INDOAI TEST ACCOUNT GENERATOR 👤 ---');
    console.log('Password: ' + COMMON_PASSWORD);
    console.log('-------------------------------------------\n');

    for (const user of testUsers) {
        process.stdout.write(`Processing ${user.email}... `);

        try {
            let userId = null;

            // 1. Attempt to create User
            const { data: authData, error: authError } = await supabase.auth.admin.createUser({
                email: user.email,
                password: COMMON_PASSWORD,
                email_confirm: true,
                user_metadata: { full_name: user.name }
            });

            if (authError) {
                // If already registered, find the user ID
                const { data: listData, error: listError } = await supabase.auth.admin.listUsers();
                if (listError) throw listError;

                const existingUser = listData.users.find(u => u.email === user.email);
                if (existingUser) {
                    userId = existingUser.id;
                    process.stdout.write('ℹ️ (Existing) ');
                } else {
                    console.log(`❌ AUTH ERROR: ${authError.message}`);
                    continue;
                }
            } else {
                userId = authData.user.id;
                process.stdout.write('✨ (New) ');
            }

            // 2. Force Upsert Profile
            if (userId) {
                const { error: profileError } = await supabase
                    .from('profiles')
                    .upsert({
                        id: userId,
                        full_name: user.name,
                        membership_tier: 'free',
                        role: 'member',
                        is_active: true,
                        assigned_landing_page: 'v1'
                    });

                if (profileError) {
                    console.log(`⚠️ PROFILE ERROR: ${profileError.message}`);
                } else {
                    console.log('✅ SYNCED');
                }
            }

        } catch (e) {
            console.log(`❌ ERROR: ${e.message}`);
        }
    }

    console.log('\n-------------------------------------------');
    console.log('DONE: Profiles synchronized with Auth.');
    console.log('-------------------------------------------');
}

createAccounts();
