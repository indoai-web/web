const postgres = require('postgres');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, './.env.local') });

async function check() {
    const db = postgres(process.env.DATABASE_URL, { ssl: 'require' });
    try {
        const tables = await db`
            SELECT tablename 
            FROM pg_tables 
            WHERE schemaname = 'public'
        `;
        console.log('Tables found:', tables.map(t => t.tablename).join(', '));

        const resourcesTable = tables.find(t => t.tablename === 'resources');
        if (resourcesTable) {
            console.log('SUCCESS: Table "resources" exists.');
        } else {
            console.error('ERROR: Table "resources" NOT found.');
        }
    } catch (e) {
        console.error('Check failed:', e.message);
    } finally {
        await db.end();
    }
}
check();
