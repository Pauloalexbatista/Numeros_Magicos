const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env');
const prodUrl = 'postgresql://neondb_owner:npg_k9J4meXqZoCR@ep-bold-fog-agxi1oca-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require';

const lines = [
    'DATABASE_URL=file:./prisma/dev.db',
    `POSTGRES_URL_PROD=${prodUrl}`,
    `POSTGRES_PRISMA_URL=${prodUrl}`,
    `POSTGRES_URL_NON_POOLING=${prodUrl}`
];

try {
    // Write a clean file with LF line endings
    fs.writeFileSync(envPath, lines.join('\n') + '\n', 'utf8');
    console.log('✅ .env file rewritten cleanly.');

    // Safety check - re-read and log lengths
    const content = fs.readFileSync(envPath, 'utf8');
    content.split('\n').forEach((line, i) => {
        if (line.trim()) {
            console.log(`Line ${i} length: ${line.length}`);
        }
    });
} catch (e) {
    console.error('❌ Error:', e.message);
}
