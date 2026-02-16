const postgres = require('postgres');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const connectionString = process.env.DATABASE_URL;

if (!connectionString || connectionString.includes('[YOUR-PASSWORD]')) {
    console.error('\x1b[31m%s\x1b[0m', 'Error: DATABASE_URL tidak ditemukan atau belum diisi password di .env.local');
    // console.log('DEBUG: URL found is:', connectionString); // For deep debugging
    process.exit(1);
}

// Log connection attempt (masked)
const maskedUrl = connectionString.replace(/:[^:@]+@/, ':****@');
console.log('\x1b[34m%s\x1b[0m', `DEBUG: Menghubungkan ke ${maskedUrl}`);

const sqlFile = process.argv[2];

if (!sqlFile) {
    console.error('\x1b[33m%s\x1b[0m', 'Gunakan: node scripts/deploy-sql.js <nama_file.sql>');
    process.exit(1);
}

const filePath = path.isAbsolute(sqlFile) ? sqlFile : path.resolve(process.cwd(), sqlFile);

if (!fs.existsSync(filePath)) {
    console.error('\x1b[31m%s\x1b[0m', `Error: File tidak ditemukan: ${filePath}`);
    process.exit(1);
}

async function deploy() {
    console.log('\x1b[36m%s\x1b[0m', `🚀 Memulai sinkronisasi: ${path.basename(filePath)}...`);

    const sqlContent = fs.readFileSync(filePath, 'utf8');
    const db = postgres(connectionString, {
        ssl: 'require',
        connect_timeout: 10
    });

    try {
        // Eksekusi SQL mentah
        await db.unsafe(sqlContent);
        console.log('\x1b[32m%s\x1b[0m', '✅ Deployment Berhasil! Perubahan sudah diterapkan di Supabase Cloud.');
    } catch (error) {
        console.error('\x1b[31m%s\x1b[0m', '❌ Deployment Gagal!');
        console.error('\x1b[31m%s\x1b[0m', `Detail Error: ${error.message}`);

        if (error.message.includes('already exists')) {
            console.log('\x1b[33m%s\x1b[0m', 'Tip: Beberapa struktur mungkin sudah ada. Gunakan IF NOT EXISTS di SQL Anda.');
        }
    } finally {
        await db.end();
        process.exit();
    }
}

deploy();
