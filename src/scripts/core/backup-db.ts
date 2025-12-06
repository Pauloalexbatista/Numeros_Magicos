import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'prisma', 'dev.db');
const BACKUP_DIR = path.join(process.cwd(), 'backups');

async function backupDatabase() {
    try {
        // Ensure backup directory exists
        if (!fs.existsSync(BACKUP_DIR)) {
            fs.mkdirSync(BACKUP_DIR, { recursive: true });
        }

        const date = new Date();
        const timestamp = date.toISOString().split('T')[0]; // YYYY-MM-DD
        const backupFilename = `dev-${timestamp}.db`;
        const backupPath = path.join(BACKUP_DIR, backupFilename);

        console.log(`📦 Starting backup...`);
        console.log(`📂 Source: ${DB_PATH}`);
        console.log(`💾 Destination: ${backupPath}`);

        // Copy file
        fs.copyFileSync(DB_PATH, backupPath);

        console.log(`✅ Backup created successfully!`);

        // Cleanup old backups (keep last 7 days)
        // TODO: Implement cleanup logic if needed

    } catch (error) {
        console.error('❌ Backup failed:', error);
        process.exit(1);
    }
}

backupDatabase();
