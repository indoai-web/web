const postgres = require('postgres');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function check() {
    console.log('--- Checking wa_logs ---');
    if (!process.env.DATABASE_URL) {
        console.error('DATABASE_URL is not defined');
        return;
    }
    const db = postgres(process.env.DATABASE_URL, { ssl: 'require' });
    try {
        // Check if table exists
        const tableCheck = await db`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'wa_logs'
            );
        `;
        console.log('Table wa_logs exists:', tableCheck[0].exists);

        if (tableCheck[0].exists) {
            const count = await db`SELECT count(*) FROM wa_logs`;
            console.log('Total records in wa_logs:', count[0].count);

            const logs = await db`SELECT * FROM wa_logs ORDER BY created_at DESC LIMIT 5`;
            console.log('Latest 5 logs:', JSON.stringify(logs, null, 2));
        }
    } catch (err) {
        console.error('Database Error:', err.message);
    } finally {
        await db.end();
    }
}

check();
