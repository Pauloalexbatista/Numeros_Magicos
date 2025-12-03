
import { prisma } from '../lib/prisma';

async function main() {
    console.log('📅 Analyzing Yearly Performance...');

    const systems = ['Sistema Platina', 'Sistema Média Vizinhos'];

    // Get all performances with dates
    const data = await prisma.systemPerformance.findMany({
        where: { systemName: { in: systems } },
        include: { draw: { select: { date: true } } }
    });

    const yearlyStats: Record<string, Record<string, { jackpots: number, highPrizes: number, total: number }>> = {};

    data.forEach(p => {
        const year = p.draw.date.getFullYear().toString();
        const sys = p.systemName;

        if (!yearlyStats[year]) yearlyStats[year] = {};
        if (!yearlyStats[year][sys]) yearlyStats[year][sys] = { jackpots: 0, highPrizes: 0, total: 0 };

        yearlyStats[year][sys].total++;
        if (p.hits === 5) yearlyStats[year][sys].jackpots++;
        if (p.hits === 4) yearlyStats[year][sys].highPrizes++;
    });

    // Print Table
    console.log('\nYear | System | Jackpots (5) | High Prizes (4)');
    console.log('-----|--------|--------------|----------------');

    const years = Object.keys(yearlyStats).sort();

    for (const year of years) {
        const stats = yearlyStats[year];
        for (const sys of systems) {
            const s = stats[sys] || { jackpots: 0, highPrizes: 0 };
            const sysName = sys === 'Sistema Platina' ? 'Platina' : 'Vizinhos';
            console.log(`${year} | ${sysName.padEnd(8)} | ${s.jackpots.toString().padStart(12)} | ${s.highPrizes.toString().padStart(14)}`);
        }
        console.log('-----+--------+--------------+----------------');
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
