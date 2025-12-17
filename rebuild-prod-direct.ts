import { PrismaClient } from '@prisma/client';

const PROD_URL = "postgresql://neondb_owner:npg_k9J4meXqZoCR@ep-bold-fog-agxi1oca-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require";

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: PROD_URL
        }
    }
});

async function cleanAndRebuild() {
    console.log('🧹 ========================================');
    console.log('   CLEAN AND REBUILD PRODUCTION');
    console.log('========================================\n');

    try {
        // STEP 1: Clean production database
        console.log('STEP 1: Cleaning production database...\n');

        console.log('🗑️  Deleting SystemPerformance...');
        const p1 = await prisma.systemPerformance.deleteMany({});
        console.log(`   ✅ Deleted ${p1.count} records`);

        console.log('🗑️  Deleting StarSystemPerformance...');
        const p2 = await prisma.starSystemPerformance.deleteMany({});
        console.log(`   ✅ Deleted ${p2.count} records`);

        console.log('🗑️  Deleting SystemPrediction...');
        const p3 = await prisma.systemPrediction.deleteMany({});
        console.log(`   ✅ Deleted ${p3.count} records`);

        console.log('🗑️  Deleting SystemRanking...');
        const p4 = await prisma.systemRanking.deleteMany({});
        console.log(`   ✅ Deleted ${p4.count} records`);

        console.log('🗑️  Deleting StarSystemRanking...');
        const p5 = await prisma.starSystemRanking.deleteMany({});
        console.log(`   ✅ Deleted ${p5.count} records`);

        console.log('🗑️  Deleting CachedPrediction...');
        const p6 = await prisma.cachedPrediction.deleteMany({});
        console.log(`   ✅ Deleted ${p6.count} records`);

        console.log('🗑️  Deleting RankedSystem...');
        const p7 = await prisma.rankedSystem.deleteMany({});
        console.log(`   ✅ Deleted ${p7.count} records`);

        console.log('🗑️  Deleting SystemPerformanceStaging...');
        const p8 = await prisma.systemPerformanceStaging.deleteMany({});
        console.log(`   ✅ Deleted ${p8.count} records`);

        console.log('\n✅ Production database cleaned!\n');

        // STEP 2: Import draws from local
        console.log('STEP 2: Importing draws from local database...\n');

        const localPrisma = new PrismaClient({
            datasources: {
                db: {
                    url: "file:./prisma/dev.db"
                }
            }
        });

        const draws = await localPrisma.draw.findMany({
            orderBy: { date: 'asc' }
        });

        console.log(`📥 Found ${draws.length} draws in local database`);
        console.log('📤 Importing to production...');

        const batchSize = 500;
        for (let i = 0; i < draws.length; i += batchSize) {
            const batch = draws.slice(i, i + batchSize);
            await prisma.draw.createMany({
                data: batch
            });
            process.stdout.write('.');
        }

        console.log(`\n✅ Imported ${draws.length} draws to production!\n`);

        await localPrisma.$disconnect();

        console.log('========================================');
        console.log('✅ STEP 1 & 2 COMPLETE!');
        console.log('========================================\n');
        console.log('Next steps (run manually):');
        console.log('1. Set DATABASE_URL to production');
        console.log('2. Run: npx tsx src/scripts/core/turbo-backfill.ts');
        console.log('3. Run: npx tsx src/scripts/core/turbo-stars.ts');
        console.log('4. Run: npx tsx src/scripts/core/turbo-medals.ts');
        console.log('5. Run: npx tsx src/scripts/core/turbo-ml.ts\n');

    } catch (error) {
        console.error('\n❌ Error:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

cleanAndRebuild();
