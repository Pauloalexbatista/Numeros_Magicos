import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const PROD_URL = "postgresql://neondb_owner:npg_k9J4meXqZoCR@ep-bold-fog-agxi1oca-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require";

async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function importWithRetry() {
    console.log('📤 ========================================');
    console.log('   IMPORT DRAWS (WITH RETRY)');
    console.log('========================================\n');

    const prisma = new PrismaClient({
        datasources: { db: { url: PROD_URL } },
        log: ['error']
    });

    try {
        // Load draws
        const drawsPath = path.join(process.cwd(), 'prisma', 'seeds', 'draws.json');
        const draws = JSON.parse(fs.readFileSync(drawsPath, 'utf-8'));

        console.log(`📥 Loaded ${draws.length} draws\n`);
        console.log('📤 Importing (batches of 50, with 1s delay)...\n');

        const batchSize = 50;
        let imported = 0;
        let errors = 0;

        for (let i = 0; i < draws.length; i += batchSize) {
            const batch = draws.slice(i, i + batchSize);

            try {
                await prisma.draw.createMany({
                    data: batch,
                    skipDuplicates: true
                });
                imported += batch.length;
                process.stdout.write('.');

                // Small delay to avoid overwhelming connection
                await sleep(1000);

            } catch (error: any) {
                errors++;
                console.log(`\n⚠️  Batch ${i} error (will retry): ${error.message}`);

                // Retry once
                try {
                    await sleep(2000);
                    await prisma.draw.createMany({
                        data: batch,
                        skipDuplicates: true
                    });
                    imported += batch.length;
                    console.log(`✅ Retry successful`);
                } catch (retryError: any) {
                    console.log(`❌ Retry failed: ${retryError.message}`);
                }
            }
        }

        console.log(`\n\n📊 Results:`);
        console.log(`   Imported: ${imported} draws`);
        console.log(`   Errors: ${errors}\n`);

        // Verify
        const count = await prisma.draw.count();
        console.log(`✅ Production has ${count} draws\n`);

    } catch (error) {
        console.error('\n❌ Fatal error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

importWithRetry();
