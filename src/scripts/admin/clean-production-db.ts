import { PrismaClient } from '@prisma/client';

/**
 * CLEAN PRODUCTION DATABASE
 * 
 * This script DELETES ALL DATA from production PostgreSQL database.
 * Use this to clean duplicates before syncing fresh data.
 * 
 * ⚠️ WARNING: This is DESTRUCTIVE! Only run on production DB.
 */

const prisma = new PrismaClient();

async function cleanProductionDatabase() {
    console.log('🧹 ========================================');
    console.log('   CLEAN PRODUCTION DATABASE');
    console.log('========================================\n');

    try {
        console.log('⚠️  WARNING: This will DELETE ALL DATA from the database!');
        console.log('   Make sure you are connected to PRODUCTION PostgreSQL.\n');

        // Delete in reverse dependency order
        console.log('🗑️  Deleting data...\n');

        // 1. Delete performance records (depends on draws and systems)
        const deletedPerformance = await prisma.systemPerformance.deleteMany({});
        console.log(`   ✅ SystemPerformance: ${deletedPerformance.count} records deleted`);

        const deletedStarPerformance = await prisma.starSystemPerformance.deleteMany({});
        console.log(`   ✅ StarSystemPerformance: ${deletedStarPerformance.count} records deleted`);

        const deletedStaging = await prisma.systemPerformanceStaging.deleteMany({});
        console.log(`   ✅ SystemPerformanceStaging: ${deletedStaging.count} records deleted`);

        // 2. Delete predictions (depends on draws)
        const deletedPredictions = await prisma.systemPrediction.deleteMany({});
        console.log(`   ✅ SystemPrediction: ${deletedPredictions.count} records deleted`);

        // 3. Delete rankings
        const deletedSystemRankings = await prisma.systemRanking.deleteMany({});
        console.log(`   ✅ SystemRanking: ${deletedSystemRankings.count} records deleted`);

        const deletedStarRankings = await prisma.starSystemRanking.deleteMany({});
        console.log(`   ✅ StarSystemRanking: ${deletedStarRankings.count} records deleted`);

        // 4. Delete cached predictions
        const deletedCache = await prisma.cachedPrediction.deleteMany({});
        console.log(`   ✅ CachedPrediction: ${deletedCache.count} records deleted`);

        // 5. Delete ranked systems
        const deletedSystems = await prisma.rankedSystem.deleteMany({});
        console.log(`   ✅ RankedSystem: ${deletedSystems.count} records deleted`);

        // 6. Delete draws (last, as others depend on it)
        const deletedDraws = await prisma.draw.deleteMany({});
        console.log(`   ✅ Draw: ${deletedDraws.count} records deleted`);

        // 7. Delete ML/AI related tables
        const deletedExclusionCache = await prisma.exclusionCache.deleteMany({});
        console.log(`   ✅ ExclusionCache: ${deletedExclusionCache.count} records deleted`);

        const deletedExclusionPerformance = await prisma.exclusionPerformance.deleteMany({});
        console.log(`   ✅ ExclusionPerformance: ${deletedExclusionPerformance.count} records deleted`);

        const deletedMLModels = await prisma.mLModelTraining.deleteMany({});
        console.log(`   ✅ MLModelTraining: ${deletedMLModels.count} records deleted`);

        // 8. Delete statistics cache
        const deletedStatsCache = await prisma.statisticsCache.deleteMany({});
        console.log(`   ✅ StatisticsCache: ${deletedStatsCache.count} records deleted`);

        console.log('\n========================================');
        console.log('✅ DATABASE CLEANED SUCCESSFULLY!');
        console.log('========================================\n');
        console.log('Next step: Run sync script to populate with clean data.');
        console.log('Command: SYNC_PROD.bat\n');

    } catch (error) {
        console.error('\n❌ Error cleaning database:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

cleanProductionDatabase();
