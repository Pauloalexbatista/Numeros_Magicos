
import { prisma } from '../lib/prisma';

async function checkRanking() {
    const ranking = await prisma.systemRanking.findMany({
        orderBy: { avgAccuracy: 'desc' },
        take: 10
    });

    console.log('Top 10 Systems:');
    ranking.forEach((r, i) => {
        console.log(`${i + 1}. ${r.systemName} - Accuracy: ${r.avgAccuracy.toFixed(2)}%`);
    });
}

checkRanking()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
