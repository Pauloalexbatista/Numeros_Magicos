import { prisma } from '../../lib/prisma';

async function main() {
    console.log('🔍 Checking Ranking Tables Data Integrity...\n');

    // 1. Check RankedSystem
    const systemCount = await prisma.rankedSystem.count();
    console.log(`📋 RankedSystem Count: ${systemCount}`);

    const systemsWithEmptyName = await prisma.rankedSystem.count({
        where: { name: '' }
    });
    if (systemsWithEmptyName > 0) console.log(`⚠️  Found ${systemsWithEmptyName} systems with empty name!`);

    // 2. Check SystemRanking
    const rankingCount = await prisma.systemRanking.count();
    console.log(`🏆 SystemRanking Count: ${rankingCount}`);

    const rankingsWithZeroPredictions = await prisma.systemRanking.count({
        where: { totalPredictions: 0 }
    });
    if (rankingsWithZeroPredictions > 0) console.log(`ℹ️  Found ${rankingsWithZeroPredictions} rankings with 0 predictions.`);

    // 3. Check SystemPerformance
    const performanceCount = await prisma.systemPerformance.count();
    console.log(`📈 SystemPerformance Count: ${performanceCount}`);

    const perfWithEmptyPredictions = await prisma.systemPerformance.count({
        where: { predictedNumbers: '[]' } // Assuming empty JSON array string
    });
    if (perfWithEmptyPredictions > 0) console.log(`⚠️  Found ${perfWithEmptyPredictions} performances with empty predictions.`);

    // 4. Sample Data
    if (rankingCount > 0) {
        console.log('\n--- Top 5 Ranked Systems ---');
        const topRanked = await prisma.systemRanking.findMany({
            take: 5,
            orderBy: { avgAccuracy: 'desc' },
            include: { system: true }
        });
        topRanked.forEach(r => {
            console.log(`${r.systemName}: ${r.avgAccuracy.toFixed(2)}% (${r.totalPredictions} preds)`);
        });
    } else {
        console.log('\n⚠️  No ranking data found. The tables might be empty.');
    }

    if (performanceCount === 0) {
        console.log('⚠️  No performance history found.');
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
