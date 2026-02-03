
import { prisma } from '@/lib/prisma';

async function main() {
    const latestDraw = await prisma.draw.findFirst({ orderBy: { date: 'desc' } });
    if (!latestDraw) return console.log("No draws found");

    console.log(`Latest Draw: ${latestDraw.date.toISOString()} (ID: ${latestDraw.id})`);

    const rankings = await prisma.systemRanking.findMany({
        take: 5,
        orderBy: { avgAccuracy: 'desc' }
    });

    console.log("Top 5 Systems Updated At:");
    rankings.forEach(r => console.log(`${r.systemName}: ${r.lastUpdated.toISOString()}`));

    const predictions = await prisma.cachedPrediction.count({
        where: { updatedAt: { gte: new Date(Date.now() - 1000 * 60 * 60) } } // Updated in last hour
    });
    console.log(`Predictions updated in last hour: ${predictions}`);
}

main();
