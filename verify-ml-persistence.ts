
import { prisma } from './src/lib/prisma';
import fs from 'fs';
import path from 'path';

// Manually load .env because dotenv seems flaky in this environment
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
    console.log('📄 Loading .env manually...');
    const envConfig = fs.readFileSync(envPath, 'utf-8');
    envConfig.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            process.env[key.trim()] = value.trim().replace(/"/g, '');
        }
    });
}

async function main() {
    console.log('🧪 Verifying ML Persistence...');
    console.log('DB URL Configured:', !!process.env.POSTGRES_PRISMA_URL || !!process.env.DATABASE_URL);

    const dummyWeights = JSON.stringify([{ data: [0.1, 0.2], shape: [1, 2], dtype: 'float32' }]);

    try {
        // Test Writex
        console.log('Writing to DB...');
        // Cast to any to bypass TS check if types aren't generated yet
        await (prisma.mLModelTraining as any).upsert({
            where: { modelType: 'TEST_MODEL' },
            update: {
                modelData: dummyWeights,
                accuracy: 99.9,
                lastTrained: new Date()
            },
            create: {
                modelType: 'TEST_MODEL',
                modelName: 'Test Model',
                accuracy: 99.9,
                modelData: dummyWeights
            }
        });
        console.log('✅ Write success.');

        // Test Read
        console.log('Reading from DB...');
        const record = await prisma.mLModelTraining.findUnique({
            where: { modelType: 'TEST_MODEL' }
        });

        if (record && (record as any).modelData === dummyWeights) {
            console.log('✅ Read success: modelData matches.');
        } else {
            console.error('❌ Read failed or mismatch:', record);
        }

    } catch (error) {
        console.error('❌ Verification failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
