
import { prisma } from '../lib/prisma';

async function main() {
    const rankings = await prisma.systemRanking.findMany({
        orderBy: { avgAccuracy: 'desc' }
    });

    console.log('🏆 CURRENT RANKINGS 🏆');
    console.log('=======================');
    rankings.forEach((r, i) => {
        console.log(`#${i + 1} ${r.systemName.padEnd(30)}: ${r.avgAccuracy.toFixed(2)}% (${r.totalPredictions} jogos)`);
    });
}

main().catch(console.error).finally(() => prisma.$disconnect());
