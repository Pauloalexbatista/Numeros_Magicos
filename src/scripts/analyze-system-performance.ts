import { prisma } from '../lib/prisma';

async function analyzeSystemPerformance() {
    console.log('🔍 Analyzing System Performance...\n');

    // Get all unique system names from SystemPrediction
    const allSystems = await prisma.systemPrediction.findMany({
        select: { systemName: true },
        distinct: ['systemName']
    });

    // Calculate stats for each system
    const systemStats = await Promise.all(
        allSystems.map(async ({ systemName }) => {
            const predictions = await prisma.systemPrediction.findMany({
                where: { systemName }
            });

            const jackpotCount = predictions.filter(p => p.jackpot).length;
            const antiJackpotCount = predictions.filter(p => p.antiJackpot).length;
            const totalPredictions = predictions.length;
            const avgHits = predictions.reduce((sum, p) => sum + p.hits, 0) / totalPredictions;
            const avgAntiHits = predictions.reduce((sum, p) => sum + p.antiHits, 0) / totalPredictions;
            const precision = (jackpotCount / totalPredictions) * 100;

            return {
                systemName,
                jackpotCount,
                antiJackpotCount,
                totalPredictions,
                avgHits,
                avgAntiHits,
                precision
            };
        })
    );

    // Sort by jackpot count
    systemStats.sort((a, b) => b.jackpotCount - a.jackpotCount);

    console.log('📊 RANKING BY JACKPOT COUNT:\n');
    console.log('Rank | System Name                          | Jackpots | Anti-JP | Total | Precision | Avg Hits');
    console.log('-----|--------------------------------------|----------|---------|-------|-----------|----------');

    systemStats.forEach((system, index) => {
        const rank = (index + 1).toString().padStart(4, ' ');
        const name = system.systemName.padEnd(36, ' ');
        const jp = system.jackpotCount.toString().padStart(8, ' ');
        const antiJp = system.antiJackpotCount.toString().padStart(7, ' ');
        const total = system.totalPredictions.toString().padStart(5, ' ');
        const prec = system.precision.toFixed(2).padStart(9, ' ') + '%';
        const hits = system.avgHits.toFixed(2).padStart(9, ' ');

        console.log(`${rank} | ${name} | ${jp} | ${antiJp} | ${total} | ${prec} | ${hits}`);
    });

    console.log('\n\n🥉 BRONZE SYSTEM ANALYSIS:');
    const bronze = systemStats.find(s => s.systemName === 'Sistema Bronze');
    if (bronze) {
        console.log(`Jackpots: ${bronze.jackpotCount}`);
        console.log(`Anti-Jackpots: ${bronze.antiJackpotCount}`);
        console.log(`Precision: ${bronze.precision.toFixed(2)}%`);
        console.log(`Avg Hits: ${bronze.avgHits.toFixed(2)}`);
        console.log(`Avg Anti-Hits: ${bronze.avgAntiHits.toFixed(2)}`);
        console.log(`Total Predictions: ${bronze.totalPredictions}`);

        // Get top 9 systems that Bronze uses (excluding medal systems)
        const top9 = systemStats
            .filter(s => !['Sistema Ouro', 'Sistema Prata', 'Sistema Bronze', 'Sistema Platina'].includes(s.systemName))
            .slice(0, 9);

        console.log('\n📋 Bronze uses these TOP 9 systems (by SystemRanking):');

        // Get actual ranking from SystemRanking table
        const rankings = await prisma.systemRanking.findMany({
            orderBy: { avgAccuracy: 'desc' },
            take: 9
        });

        rankings.forEach((sys, i) => {
            const stats = systemStats.find(s => s.systemName === sys.systemName);
            console.log(`  ${i + 1}. ${sys.systemName} (${stats?.jackpotCount || 0} JPs, ${sys.avgAccuracy.toFixed(2)} acc)`);
        });
    }

    console.log('\n\n🏆 TOP 5 SYSTEMS BY JACKPOT COUNT:');
    systemStats.slice(0, 5).forEach((sys, i) => {
        console.log(`${i + 1}. ${sys.systemName}: ${sys.jackpotCount} jackpots (${sys.precision.toFixed(2)}%)`);
    });

    await prisma.$disconnect();
}

analyzeSystemPerformance().catch(console.error);
