
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function diagnoseStars2026() {
    console.log('🌟 Diagnosing Star Systems Performance 2026');
    const start2026 = new Date('2026-01-01T00:00:00.000Z');

    const games = ['EUROMILLIONS', 'TOTOLOTO', 'EURODREAMS'];

    for (const game of games) {
        console.log(`\n--- ${game} ---`);

        // 1. Get Draws
        const draws = await prisma.draw.findMany({
            where: {
                game,
                date: { gte: start2026 }
            },
            orderBy: { date: 'asc' },
            select: { id: true, date: true, stars: true }
        });

        console.log(`Draws in 2026: ${draws.length}`);
        if (draws.length === 0) continue;

        const drawIds = draws.map(d => d.id);

        // 2. Check Top Performers
        // Jackpot Criteria:
        // EM: 2 hits
        // TL: 1 hit (Lucky Number)
        // ED: 1 hit (Dream Number)
        const jackpotHits = game === 'EUROMILLIONS' ? 2 : 1;

        const perfs = await prisma.starSystemPerformance.findMany({
            where: {
                drawId: { in: drawIds },
                hits: { gte: jackpotHits }
            },
            select: { systemName: true, hits: true, draw: { select: { date: true } } }
        });

        const winners: Record<string, number> = {};
        perfs.forEach(p => {
            winners[p.systemName] = (winners[p.systemName] || 0) + 1;
        });

        // Sort by wins
        const sortedWinners = Object.entries(winners).sort((a, b) => b[1] - a[1]).slice(0, 5);

        console.log(`Top 5 Jackpot Winners (${jackpotHits} star(s)):`);
        sortedWinners.forEach(([name, count]) => {
            console.log(` - ${name}: ${count} wins`);
        });

        if (sortedWinners.length > 0) {
            const topSys = sortedWinners[0][0];
            console.log(`\nAudit for Top System: ${topSys}`);
            const sysPerfs = perfs.filter(p => p.systemName === topSys);
            sysPerfs.forEach(p => console.log(`   ${p.draw.date.toISOString().split('T')[0]}: ${p.hits} hits`));
        }
    }
}

diagnoseStars2026()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
