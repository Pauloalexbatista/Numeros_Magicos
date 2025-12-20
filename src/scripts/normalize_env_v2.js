const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env');

function fix() {
    console.log('Reading .env...');
    const buffer = fs.readFileSync(envPath);

    // Check for UTF-16LE BOM
    let content;
    if (buffer[0] === 0xFF && buffer[1] === 0xFE) {
        content = buffer.toString('utf16le');
        console.log('Detected UTF-16LE');
    } else {
        content = buffer.toString('utf8');
        console.log('Treating as UTF-8');
    }

    // Clean all weirdness: nulls, BOM, and any non-printable chars except newlines
    content = content.replace(/\0/g, '')
        .replace(/^\uFEFF/, '')
        .replace(/\r/g, ''); // Use \n only for mapping

    const lines = content.split('\n');
    const uniqueVars = new Map();

    lines.forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
            const firstEq = trimmed.indexOf('=');
            if (firstEq !== -1) {
                const key = trimmed.substring(0, firstEq).trim();
                const value = trimmed.substring(firstEq + 1).trim();
                // Avoid capturing the "re" at the end of the broken file
                if (key.length > 1) {
                    uniqueVars.set(key, value);
                }
            }
        }
    });

    const prodUrl = 'postgresql://neondb_owner:npg_k9J4meXqZoCR@ep-bold-fog-agxi1oca-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require';

    // Fix the specific broken ones
    uniqueVars.set('POSTGRES_URL_PROD', prodUrl);
    uniqueVars.set('POSTGRES_PRISMA_URL', prodUrl);
    uniqueVars.set('POSTGRES_URL_NON_POOLING', prodUrl);

    let newContent = '';
    uniqueVars.forEach((value, key) => {
        newContent += `${key}=${value}\n`;
    });

    // Write as clean UTF-8
    fs.writeFileSync(envPath, newContent, 'utf8');
    console.log('✅ .env normalized to UTF-8.');
}

fix();
