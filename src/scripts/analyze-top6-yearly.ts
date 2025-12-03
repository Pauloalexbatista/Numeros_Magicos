
import { prisma } from '../lib/prisma';

async function main() {
    console.log('🏆 Analyzing Top 6 Systems (Yearly Breakdown)...');

    // 1. Get Top 6 Systems
    const topRankings = await prisma.systemRanking.findMany({
        orderBy: { avgAccuracy: 'desc' },
        take: 6,
        select: { systemName: true, avgAccuracy: true }
    });

    const systems = topRankings.map(r => r.systemName);
    console.log(`\nTop 6 Systems: ${systems.join(', ')}`);

    // 2. Get Performance Data
    const data = await prisma.systemPerformance.findMany({
        where: { systemName: { in: systems } },
        include: { draw: { select: { date: true } } }
    });

    const yearlyStats: Record<string, Record<string, { jackpots: number, highPrizes: number }>> = {};

    data.forEach(p => {
        const year = p.draw.date.getFullYear().toString();
        const sys = p.systemName;

        if (!yearlyStats[year]) yearlyStats[year] = {};
        if (!yearlyStats[year][sys]) yearlyStats[year][sys] = { jackpots: 0, highPrizes: 0 };

        if (p.hits === 5) yearlyStats[year][sys].jackpots++;
        if (p.hits === 4) yearlyStats[year][sys].highPrizes++;
    });

    // 3. Print Table
    const years = Object.keys(yearlyStats).sort().reverse().slice(0, 5); // Last 5 years

    console.log('\nYear | System (Rank)          | Jackpots (5) | High Prizes (4)');
    console.log('-----|------------------------|--------------|----------------');

    for (const year of years) {
        console.log(`\n📅 ${year}`);
        const stats = yearlyStats[year];

        // Sort by Jackpots then High Prizes for this year
        const sortedSystems = systems.sort((a, b) => {
            const statsA = stats[a] || { jackpots: 0, highPrizes: 0 };
            const statsB = stats[b] || { jackpots: 0, highPrizes: 0 };
            return (statsB.jackpots - statsA.jackpots) || (statsB.highPrizes - statsA.highPrizes);
        });

        for (const sys of sortedSystems) {
            const s = stats[sys] || { jackpots: 0, highPrizes: 0 };
            const rank = topRankings.find(r => r.systemName === sys)?.avgAccuracy.toFixed(1) + '%';
            console.log(`     | ${sys.padEnd(22)} | ${s.jackpots.toString().padStart(12)} | ${s.highPrizes.toString().padStart(14)}`);
        }
        console.log('-----|------------------------|--------------|----------------');
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
