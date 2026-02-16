const postgres = require('postgres');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function test() {
    const db = postgres(process.env.DATABASE_URL, { ssl: 'require' });
    try {
        const results = await db`SELECT metadata FROM module_settings WHERE module_name = 'messaging-wa'`;
        if (results.length === 0) {
            console.log('No config found.');
            return;
        }

        const token = results[0].metadata.api_token;
        console.log('Testing Fonnte API with token:', token.substring(0, 4) + '...');

        const response = await fetch('https://api.fonnte.com/get-devices', {
            method: 'POST',
            headers: { 'Authorization': token },
            body: '{}'
        });

        const json = await response.json();
        console.log('--- Fonnte Response ---');
        console.log(JSON.stringify(json, null, 2));

    } catch (err) {
        console.error('Test Error:', err.message);
    } finally {
        await db.end();
    }
}

test();
