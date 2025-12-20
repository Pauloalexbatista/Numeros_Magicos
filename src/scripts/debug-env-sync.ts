import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

console.log('--- DEBUG ENV START ---');
console.log('Current CWD:', process.cwd());

const envPath = path.resolve(process.cwd(), '.env');
console.log('Checking .env at:', envPath);
console.log('Exists:', fs.existsSync(envPath));

if (fs.existsSync(envPath)) {
    const stats = fs.statSync(envPath);
    console.log('Size:', stats.size, 'bytes');
    const buf = fs.readFileSync(envPath);
    console.log('First 5 bytes (Hex):', buf.subarray(0, 5).toString('hex'));
}

dotenv.config({ path: envPath });

const vars = [
    'DATABASE_URL',
    'POSTGRES_PRISMA_URL',
    'POSTGRES_URL_NON_POOLING',
    'POSTGRES_URL_PROD'
];

vars.forEach(v => {
    const val = process.env[v];
    console.log(`${v}:`, val ? `${val.substring(0, 20)}... (Length: ${val.length})` : 'MISSING');
});

console.log('--- DEBUG ENV END ---');
