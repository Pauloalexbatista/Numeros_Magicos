
import { prisma } from '../lib/prisma';

async function checkRankings() {
    console.log('🔍 Checking System Rankings in DB...\n');

    const rankings = await prisma.systemRanking.findMany({
        orderBy: { avgAccuracy: 'desc' }
    });

    console.log('System Name                          | Avg Accuracy | Predictions');
    console.log('-------------------------------------|--------------|------------');

    rankings.forEach(r => {
        console.log(`${r.systemName.padEnd(36)} | ${r.avgAccuracy.toFixed(2)}%       | ${r.totalPredictions}`);
    });
}

checkRankings()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
