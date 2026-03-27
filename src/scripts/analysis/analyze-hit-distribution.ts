
import { prisma } from '../../lib/prisma';
import { rankedSystems } from '../../services/ranking'; // Actually it's ranking.ts that exports rankedSystems directly or re-exports.
// Let's use ranking.ts as it re-exports everything cleanly
// import { rankedSystems } from '../../services/ranking';

async function main() {
    // ENABLE FULL RANKING MODE
    process.env.FULL_RANKING_MODE = 'true';

    console.log("📊 Analyzing Hit Distribution by Rank (Last 20 Draws)...");

    // Get last 20 draws for EuroMillions (as a sample)
    const draws = await prisma.draw.findMany({
        where: { game: 'EUROMILLIONS' },
        orderBy: { date: 'desc' },
        take: 20
    });

    // History for prediction (all draws older than the sample)
    const allDraws = await prisma.draw.findMany({
        where: { game: 'EUROMILLIONS' },
        orderBy: { date: 'desc' }
    });

    const results: Record<string, number[]> = {};

    // Initialize buckets: 1-5, 6-10, 11-15, 16-20, 21-30, 31-40, 41-50
    // Actually simpler: just store all ranks and process later

    // Select a few key systems to analyze
    const targetSystems = rankedSystems.filter(s =>
        ['Hot Numbers', 'Clustering', 'Markov Chain', 'Monte Carlo', 'Sistema Oscilação Universal V2', 'Sist Média + 3 Otimizado'].includes(s.name)
    );

    console.log(`Analyzing ${targetSystems.length} systems: ${targetSystems.map(s => s.name).join(', ')}`);

    for (const system of targetSystems) {
        process.stdout.write(`\n🔍 ${system.name}: `);
        results[system.name] = [];

        for (const draw of draws) {
            process.stdout.write('.');
            // History *before* this draw
            const history = allDraws.filter(d => d.date < draw.date);

            // Generate FULL ranking (50 numbers)
            // Note: `generateTop10` is the method name, but with env var it returns everything
            const fullRanking = await system.generateTop10(history);

            // Get winning numbers
            const winningNumbers = typeof draw.numbers === 'string'
                ? (typeof draw.numbers === "string" ? JSON.parse(draw.numbers) : draw.numbers)
                : draw.numbers;

            // Find rank of each winning number
            winningNumbers.forEach((winNum: number) => {
                const rank = fullRanking.indexOf(winNum) + 1; // 1-based
                if (rank > 0) {
                    results[system.name].push(rank);
                }
            });
        }
    }

    console.log("\n\n📊 RESULTS (Hit Counts by Rank Range):");
    console.log("--------------------------------------------------------------------------------");
    console.log(`${'System'.padEnd(30)} | 01-15 | 16-30 | 31-50 | Total Hits analyzed`);
    console.log("--------------------------------------------------------------------------------");

    for (const [sysName, ranks] of Object.entries(results)) {
        const top15 = ranks.filter(r => r <= 15).length;
        const mid15 = ranks.filter(r => r > 15 && r <= 30).length;
        const low20 = ranks.filter(r => r > 30).length;
        const total = ranks.length;

        // Calculate %
        const p15 = ((top15 / total) * 100).toFixed(1) + '%';
        const pMid = ((mid15 / total) * 100).toFixed(1) + '%';
        const pLow = ((low20 / total) * 100).toFixed(1) + '%';

        console.log(`${sysName.padEnd(30)} | ${top15.toString().padEnd(2)} (${p15}) | ${mid15.toString().padEnd(2)} (${pMid}) | ${low20.toString().padEnd(2)} (${pLow}) | ${total}`);
    }
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
