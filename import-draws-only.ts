import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const PROD_URL = "postgresql://neondb_owner:npg_k9J4meXqZoCR@ep-bold-fog-agxi1oca-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require";

async function importDrawsOnly() {
    console.log('📤 ========================================');
    console.log('   IMPORT DRAWS TO PRODUCTION');
    console.log('========================================\n');

    const prisma = new PrismaClient({
        datasources: { db: { url: PROD_URL } }
    });

    try {
        // Load draws from JSON
        const drawsPath = path.join(process.cwd(), 'prisma', 'seeds', 'draws.json');
        const draws = JSON.parse(fs.readFileSync(drawsPath, 'utf-8'));

        console.log(`📥 Loaded ${draws.length} draws from JSON\n`);
        console.log('📤 Importing to production (batches of 100)...\n');

        const batchSize = 100;
        let imported = 0;

        for (let i = 0; i < draws.length; i += batchSize) {
            const batch = draws.slice(i, i + batchSize);
            await prisma.draw.createMany({
                data: batch,
                skipDuplicates: true
            });
            imported += batch.length;
            process.stdout.write('.');
        }

        console.log(`\n\n✅ Imported ${imported} draws!\n`);

        // Verify
        const count = await prisma.draw.count();
        console.log(`📊 Production database now has ${count} draws\n`);

        console.log('========================================');
        console.log('✅ IMPORT COMPLETE!');
        console.log('========================================\n');
        console.log('Next: Run turbo-backfill to recalculate everything\n');

    } catch (error) {
        console.error('\n❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

importDrawsOnly();
