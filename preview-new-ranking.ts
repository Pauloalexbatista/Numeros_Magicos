
import { prisma } from './src/lib/prisma';

async function previewRanking() {
    console.log("📊 Generating Ranking Preview (Last 100 Draws Only)...\n");

    // 1. Determine the Draw Range
    const lastDraw = await prisma.draw.findFirst({ orderBy: { id: 'desc' } });
    if (!lastDraw) return console.log("No draws found.");

    const startDrawId = Math.max(1, lastDraw.id - 100);
    console.log(`Range: Draw #${startDrawId} to #${lastDraw.id} (Total: ${lastDraw.id - startDrawId + 1} draws)`);

    // 2. Fetch Performance Data for this range
    const performances = await prisma.systemPerformance.findMany({
        where: {
            drawId: { gte: startDrawId }
        },
        select: {
            systemName: true,
            hits: true,
            // jackpot is not a field in SystemPerformance, implied by hits=5
            accuracy: true // Keeping old metric for comparison
        }
    });

    // 3. Aggregate Stats
    const stats: Record<string, {
        name: string,
        hits3: number,
        hits4: number,
        hits5: number,
        totalPreds: number,
        sumAccuracy: number
    }> = {};

    performances.forEach(p => {
        if (!stats[p.systemName]) {
            stats[p.systemName] = {
                name: p.systemName,
                hits3: 0, hits4: 0, hits5: 0,
                totalPreds: 0, sumAccuracy: 0
            };
        }

        const s = stats[p.systemName];
        s.totalPreds++;
        s.sumAccuracy += p.accuracy;

        if (p.hits === 3) s.hits3++;
        if (p.hits === 4) s.hits4++;
        if (p.hits === 5) s.hits5++;
    });

    // 4. Calculate Scores and Format
    const ranking = Object.values(stats).map(s => {
        // Proposed Scoring: 3hits=1pt, 4hits=10pts, 5hits=100pts
        const qualityScore = (s.hits3 * 1) + (s.hits4 * 10) + (s.hits5 * 100);

        // Win Rate (3+):
        const totalWins = s.hits3 + s.hits4 + s.hits5;
        const winRate = (totalWins / s.totalPreds) * 100;

        // Old Accuracy
        const oldAccuracy = s.sumAccuracy / s.totalPreds;

        return {
            System: s.name,
            'Old Acc (%)': oldAccuracy.toFixed(1),
            'Win Rate 3+ (%)': winRate.toFixed(1),
            'Score': qualityScore,
            '3 Hits': s.hits3,
            '4 Hits': s.hits4,
            '5 Hits': s.hits5
        };
    });

    // 5. Sort by Score
    ranking.sort((a, b) => b.Score - a.Score);

    // 6. Display Top 20
    console.table(ranking.slice(0, 20));
}

previewRanking()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
