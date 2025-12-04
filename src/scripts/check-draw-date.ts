
import { prisma } from '../lib/prisma';

async function checkLatestDraw() {
    const lastDraw = await prisma.draw.findFirst({
        orderBy: { date: 'desc' }
    });

    const lastRanking = await prisma.systemRanking.findFirst({
        orderBy: { lastUpdated: 'desc' }
    });

    console.log(`Latest Draw: ${lastDraw?.date.toISOString()}`);
    console.log(`Last Ranking Update: ${lastRanking?.lastUpdated.toISOString()}`);
}

checkLatestDraw()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
