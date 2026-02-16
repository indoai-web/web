const postgres = require('postgres');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function update() {
    const db = postgres(process.env.DATABASE_URL, { ssl: 'require' });
    try {
        const metadata = { api_token: 'sK9qiFd2by9FsTSADx3u', device_id: '' };
        await db`
            UPDATE module_settings 
            SET metadata = ${db.json(metadata)}
            WHERE module_name = 'messaging-wa'
        `;
        console.log('--- TOKEN UPDATED TO sK9q... SUCCESSFULLY ---');
    } catch (err) {
        console.error('Update Error:', err.message);
    } finally {
        await db.end();
    }
}

update();
