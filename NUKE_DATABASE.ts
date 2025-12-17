/**
 * ⚠️ DANGER: This script will DELETE ALL DATA from production database
 * 
 * This will:
 * - Delete all SystemPerformance records
 * - Delete all SystemRanking records
 * - Delete all CachedPrediction records
 * - Delete all Draw records
 * - Keep the schema intact (tables remain, just empty)
 * 
 * After running this, you'll need to run MASTER_UPDATE.bat locally
 * and then SYNC_PROD.bat to repopulate with clean data.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function nukeDatabase() {
    console.log('⚠️  WARNING: You are about to DELETE ALL DATA from production database!');
    console.log('');
    console.log('This will remove:');
    console.log('  - All SystemPerformance records');
    console.log('  - All SystemRanking records');
    console.log('  - All CachedPrediction records');
    console.log('  - All Draw records');
    console.log('  - All RankedSystem records');
    console.log('');
    console.log('Press Ctrl+C NOW if you want to cancel!');
    console.log('Waiting 5 seconds...');

    await new Promise(resolve => setTimeout(resolve, 5000));

    console.log('\n🔥 Starting database wipe...\n');

    try {
        // Delete in correct order (respecting foreign keys)
        console.log('Deleting SystemPerformance...');
        const perfCount = await prisma.systemPerformance.deleteMany({});
        console.log(`✅ Deleted ${perfCount.count} SystemPerformance records`);

        console.log('Deleting SystemRanking...');
        const rankCount = await prisma.systemRanking.deleteMany({});
        console.log(`✅ Deleted ${rankCount.count} SystemRanking records`);

        console.log('Deleting CachedPrediction...');
        const predCount = await prisma.cachedPrediction.deleteMany({});
        console.log(`✅ Deleted ${predCount.count} CachedPrediction records`);

        console.log('Deleting RankedSystem...');
        const sysCount = await prisma.rankedSystem.deleteMany({});
        console.log(`✅ Deleted ${sysCount.count} RankedSystem records`);

        console.log('Deleting Draw...');
        const drawCount = await prisma.draw.deleteMany({});
        console.log(`✅ Deleted ${drawCount.count} Draw records`);

        console.log('\n✅ DATABASE WIPED SUCCESSFULLY!');
        console.log('\nNext steps:');
        console.log('1. Run MASTER_UPDATE.bat locally to regenerate all data');
        console.log('2. Run SYNC_PROD.bat to upload clean data to production');

    } catch (error) {
        console.error('❌ Error wiping database:', error);
    } finally {
        await prisma.$disconnect();
    }
}

nukeDatabase();
