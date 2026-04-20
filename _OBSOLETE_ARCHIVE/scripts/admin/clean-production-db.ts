import { prisma } from '../../lib/prisma';

/**
 * CLEAN PRODUCTION DATABASE (Complete v3)
 * 
 * This script DELETES ALL DATA from production PostgreSQL database.
 * Use this to clean everything before syncing fresh data.
 * 
 * ⚠️ WARNING: This is DESTRUCTIVE! Only run on production DB.
 */

// Use shared prisma client

async function cleanProductionDatabase() {
    console.log('🧹 ========================================');
    const isQuick = process.argv.includes('--quick');
    console.log(`   CLEAN PRODUCTION DATABASE - ${isQuick ? 'QUICK' : 'COMPLETE'}`);
    console.log('========================================\n');

    try {
        console.log('⚠️  WARNING: This will DELETE ALL DATA from the database!');
        console.log('   Make sure you are connected to PRODUCTION PostgreSQL.\n');

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
            const deleted = await prisma[model].deleteMany({});
            console.log(`   ✅ Deleted ${deleted.count} records`);
        }

        console.log('\n========================================');
        console.log('✅ DATABASE CLEANED SUCCESSFULLY!');
        console.log('========================================\n');

    } catch (error) {
        console.error('\n❌ Error cleaning database:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

cleanProductionDatabase();
