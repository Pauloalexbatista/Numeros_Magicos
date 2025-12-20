const fs = require('fs');
const path = require('path');

const url = 'postgresql://neondb_owner:npg_k9J4meXqZoCR@ep-bold-fog-agxi1oca-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require';
const content = [
    'DATABASE_URL=file:./prisma/dev.db',
    `POSTGRES_URL_PROD=${url}`,
    `POSTGRES_PRISMA_URL=${url}`,
    `POSTGRES_URL_NON_POOLING=${url}`,
    'NEXTAUTH_URL=http://localhost:3000',
    'AUTH_TRUST_HOST=true'
].join('\n') + '\n';

const envPath = path.join(process.cwd(), '.env');

try {
    // Delete first to be absolutely sure
    if (fs.existsSync(envPath)) {
        fs.unlinkSync(envPath);
    }
    fs.writeFileSync(envPath, content, 'utf8');
    console.log('✅ .env RECONSTRUCTED FROM SCRATCH');
    console.log('--- CONTENT CHECK ---');
    console.log(fs.readFileSync(envPath, 'utf8'));
} catch (e) {
    console.error('❌ Error rewriting .env:', e.message);
}
