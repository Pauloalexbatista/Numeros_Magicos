import { PrismaClient } from '@prisma/client';

const PROD_URL = "postgresql://neondb_owner:npg_k9J4meXqZoCR@ep-bold-fog-agxi1oca-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require";

async function importDraws() {
    console.log('📦 ========================================');
    console.log('   IMPORT DRAWS TO PRODUCTION');
    console.log('========================================\n');

    const prodPrisma = new PrismaClient({
        datasources: { db: { url: PROD_URL } }
    });

    const localPrisma = new PrismaClient({
        datasources: { db: { url: "file:./prisma/dev.db" } }
    });

    try {
        // Get draws from local
        console.log('📥 Loading draws from local database...');
        const draws = await localPrisma.draw.findMany({
            orderBy: { date: 'asc' }
        });
        console.log(`   Found ${draws.length} draws\n`);

        // Import to production in batches
        console.log('📤 Importing to production...');
        const batchSize = 100;
        let imported = 0;

        for (let i = 0; i < draws.length; i += batchSize) {
            const batch = draws.slice(i, i + batchSize);
            try {
                await prodPrisma.draw.createMany({
                    data: batch,
                    skipDuplicates: true  // PostgreSQL supports this
                });
                imported += batch.length;
                process.stdout.write(`.`);
            } catch (error: any) {
                console.log(`\n⚠️  Batch ${i}-${i + batch.length} error: ${error.message}`);
            }
        }

        console.log(`\n\n✅ Imported ${imported} draws to production!\n`);

        // Verify
        const prodCount = await prodPrisma.draw.count();
        console.log(`📊 Production now has ${prodCount} draws\n`);

        console.log('========================================');
        console.log('✅ IMPORT COMPLETE!');
        console.log('========================================\n');

    } catch (error) {
        console.error('\n❌ Error:', error);
    } finally {
        await localPrisma.$disconnect();
        await prodPrisma.$disconnect();
    }
}

importDraws();
