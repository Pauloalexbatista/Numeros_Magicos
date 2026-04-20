
import { prismaProd } from '../../lib/prisma-prod';

/**
 * CLEAN PRODUCTION DATABASE (SAFE VERSION)
 * Uses isolated Prisma Client to bypass file locks and ensure target is Postgres.
 */

async function cleanProductionDatabase() {
    console.log('🧹 ========================================');
    const isQuick = process.argv.includes('--quick');
    console.log(`   CLEAN PRODUCTION DATABASE (SAFE) - ${isQuick ? 'QUICK' : 'COMPLETE'}`);
    console.log('========================================\n');

    try {
        console.log('⚠️  WARNING: This will DELETE ALL DATA from the database!');
        console.log('   Target: PRODUCTION PostgreSQL (via prisma-prod)\n');

        let models = [
            'SystemPerformance',
            'StarSystemPerformance',
            'SystemRanking',
            'StarSystemRanking',
            'CachedPrediction',
            'RankedSystem',
            'Draw'
        ];

        if (!isQuick) {
            models = [
                ...models,
                'SystemPerformanceStaging',
                'SystemPrediction',
                'ExclusionCache',
                'ExclusionPerformance',
                'MLModelTraining',
                'StatisticsCache'
            ];
        }

        for (const model of models) {
            console.log(`🗑️  Cleaning ${model}...`);
            // @ts-ignore
            const deleted = await prismaProd[model].deleteMany({});
            console.log(`   ✅ Deleted ${deleted.count} records`);
        }

        console.log('\n========================================');
        console.log('✅ DATABASE CLEANED SUCCESSFULLY!');
        console.log('========================================\n');

    } catch (error) {
        console.error('\n❌ Error cleaning database:', error);
        throw error;
    } finally {
        await prismaProd.$disconnect();
    }
}

cleanProductionDatabase();
