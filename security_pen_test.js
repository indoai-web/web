const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const tablesToTest = [
    'profiles',
    'invitations',
    'affiliate_referrals',
    'module_settings',
    'landing_pages',
    'facilities_logs'
];

async function runPenTest() {
    console.log('--- 🛡️ INDOAI SECURITY PENETRATION TEST 🛡️ ---');
    console.log(`Target: ${supabaseUrl}`);
    console.log('Security Level: Anonymous (Public Access Simulation)');
    console.log('-----------------------------------------------\n');

    let totalVulnerabilities = 0;

    for (const table of tablesToTest) {
        try {
            const { data, error, status } = await supabase
                .from(table)
                .select('*')
                .limit(1);

            let statusMsg = '';
            if (error) {
                if (status === 401 || status === 403 || error.message.includes('row-level security')) {
                    statusMsg = '✅ SECURE (RLS Active & Blocking)';
                } else if (error.message.includes('does not exist') || status === 404) {
                    statusMsg = '❌ MISSING (Table does not exist in DB)';
                } else {
                    statusMsg = `❌ ERROR ${status}: ${error.message}`;
                }
            } else {
                if (data && data.length > 0) {
                    statusMsg = '🚨 VULNERABLE! (Public Access & Data Leaked)';
                    totalVulnerabilities++;
                } else {
                    statusMsg = '⚠️ POTENTIALLY VULNERABLE (RLS might be OFF, but table is empty)';
                }
            }
            console.log(`[${table.padEnd(20)}] -> ${statusMsg}`);
        } catch (e) {
            console.log(`[${table.padEnd(20)}] -> ❌ CRITICAL ERROR: ${e.message}`);
        }
    }

    console.log('\n-----------------------------------------------');
    if (totalVulnerabilities > 0) {
        console.log(`🚨 RESULT: ${totalVulnerabilities} VULNERABILITIES DETECTED!`);
        console.log('IMMEDIATE ACTION REQUIRED: Enable RLS on the listed tables.');
    } else {
        console.log('✅ RESULT: SYSTEM SECURE OR TABLES NOT ACCESSIBLE.');
    }
    console.log('-----------------------------------------------');
}

runPenTest();
