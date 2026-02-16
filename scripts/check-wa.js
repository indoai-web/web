const postgres = require('postgres');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function check() {
    const db = postgres(process.env.DATABASE_URL, { ssl: 'require' });
    try {
        const results = await db`SELECT metadata FROM module_settings WHERE module_name = 'messaging-wa'`;
        if (results.length === 0) {
            console.log('--- ERROR: No config found for messaging-wa ---');
        } else {
            const metadata = results[0].metadata;
            console.log('--- Config Found ---');
            console.log('Token Length:', metadata.api_token ? metadata.api_token.length : 0);
            console.log('Token Start:', metadata.api_token ? metadata.api_token.substring(0, 4) + '...' : 'NONE');
            console.log('Device ID:', metadata.device_id || 'NONE');
        }
    } catch (err) {
        console.error('Database Error:', err.message);
    } finally {
        await db.end();
    }
}

check();
