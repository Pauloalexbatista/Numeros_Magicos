const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env');
const prodUrl = 'postgresql://neondb_owner:npg_k9J4meXqZoCR@ep-bold-fog-agxi1oca-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require';

const vars = {
    'DATABASE_URL': 'file:./prisma/dev.db',
    'POSTGRES_URL_PROD': prodUrl,
    'POSTGRES_PRISMA_URL': prodUrl,
    'POSTGRES_URL_NON_POOLING': prodUrl,
    'NEXTAUTH_URL': 'http://localhost:3000',
    'AUTH_TRUST_HOST': 'true'
};

try {
    const lines = Object.entries(vars).map(([k, v]) => `${k}=${v}`);
    // Write using buffer to ensure NO BOM and exactly what we want
    const content = lines.join('\n') + '\n';
    fs.writeFileSync(envPath, Buffer.from(content, 'utf8'));

    console.log('✅ .env REWRITTEN - BYTES:', Buffer.from(content, 'utf8').length);
    lines.forEach(l => console.log(`   ${l.split('=')[0]} length: ${l.length}`));
} catch (e) {
    console.error('❌ FATAL ERROR REWRITING .ENV:', e.message);
}
