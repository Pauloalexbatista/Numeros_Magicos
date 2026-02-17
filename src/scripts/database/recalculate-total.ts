import { backfillRankings, initializeSystems } from '../../services/ranking';
import { prisma } from '../../lib/prisma';

async function main() {
    console.log('🚀 TOTAL RECALCULATION: Starting from scratch...');

    try {
        await initializeSystems();

        console.log('🧹 Clearing performance and ranking tables...');

        // This clears local rankings to ensure they are rebuilt correctly
        await prisma.systemPerformance.deleteMany({});
        await prisma.starSystemPerformance.deleteMany({});
        await prisma.systemRanking.deleteMany({});
        await prisma.starSystemRanking.deleteMany({});

        console.log('✅ Tables cleared.');

        const totalDraws = await prisma.draw.count();
        console.log(`📊 Total draws in database: ${totalDraws}`);

        // Increase limit to cover everything
        // Using a high number ensures we skip nothing
        await backfillRankings(totalDraws + 100);

        console.log('\n✨ TOTAL RECALCULATION COMPLETE!');
        console.log('The local database is now 100% correct.');

    } catch (error) {
        console.error('❌ Error during total recalculation:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
