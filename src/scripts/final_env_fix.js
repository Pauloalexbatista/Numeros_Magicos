const fs = require('fs');
const prodUrl = 'postgresql://neondb_owner:npg_k9J4meXqZoCR@ep-bold-fog-agxi1oca-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require';
const content = [
    'DATABASE_URL=file:./prisma/dev.db',
    `POSTGRES_URL_PROD=${prodUrl}`,
    `POSTGRES_PRISMA_URL=${prodUrl}`,
    `POSTGRES_URL_NON_POOLING=${prodUrl}`
].join('\n') + '\n';

fs.writeFileSync('.env', content, 'utf8');
console.log('--- CONTENT START ---');
console.log(fs.readFileSync('.env', 'utf8'));
console.log('--- CONTENT END ---');
