const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env');

try {
    // Read as buffer to handle potential UTF-16/BOM
    const buffer = fs.readFileSync(envPath);
    let content = buffer.toString('utf-8');

    // Remove null bytes or weird BOM characters if they exist
    content = content.replace(/\0/g, '').replace(/^\uFEFF/, '');

    const lines = content.split(/\r?\n/);
    const uniqueVars = new Map();

    lines.forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
            const firstEq = trimmed.indexOf('=');
            if (firstEq !== -1) {
                const key = trimmed.substring(0, firstEq).trim();
                const value = trimmed.substring(firstEq + 1).trim();
                uniqueVars.set(key, value);
            }
        }
    });

    // Ensure our critical production variables are correct
    const prodUrl = 'postgresql://neondb_owner:npg_k9J4meXqZoCR@ep-bold-fog-agxi1oca-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require';
    uniqueVars.set('POSTGRES_URL_PROD', prodUrl);
    uniqueVars.set('POSTGRES_PRISMA_URL', prodUrl);
    uniqueVars.set('POSTGRES_URL_NON_POOLING', prodUrl);

    let newContent = '';
    uniqueVars.forEach((value, key) => {
        newContent += `${key}=${value}\n`;
    });

    fs.writeFileSync(envPath, newContent, { encoding: 'utf8' });
    console.log('✅ .env file normalized and cleaned successfully.');
} catch (e) {
    console.error('❌ Error fixing .env:', e.message);
}
