
import { prisma } from '@/lib/prisma';

async function main() {
    console.log("🔍 Auditing Star System Ranking...");

    const rankings = await prisma.starSystemRanking.findMany({
        orderBy: { avgAccuracy: 'desc' },
        take: 5
    });

    console.log(`Found ${rankings.length} ranked systems.`);

    for (const rank of rankings) {
        console.log(`\n⭐ System: ${rank.systemName}`);
        console.log(`   Avg Accuracy: ${rank.avgAccuracy.toFixed(2)}%`);
        console.log(`   Total Predictions: ${rank.totalPredictions}`);

        // Get last 5 performances to check the math
        const perfs = await prisma.starSystemPerformance.findMany({
            where: { systemName: rank.systemName },
            orderBy: { draw: { date: 'desc' } },
            take: 5,
            include: { draw: true }
        });

        console.log("   Recent Performance:");
        for (const p of perfs) {
            const predicted = JSON.parse(p.predictedStars);
            const actual = JSON.parse(p.actualStars);
            console.log(`     Draw ${p.draw.date.toISOString().split('T')[0]}: Pred [${predicted}] vs Actual [${actual}] -> Hits: ${p.hits} -> Acc: ${p.accuracy}%`);
        }
    }
}

main();
