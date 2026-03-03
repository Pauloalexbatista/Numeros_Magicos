
import { updateRanking, updateStarRankings } from '../services/ranking';
import { prisma } from '../lib/prisma';

async function main() {
    console.log('📊 Updating Rankings...');
    const start = performance.now();
    await updateRanking();
    await updateStarRankings();
    const end = performance.now();
    console.log(`✅ Rankings Updated in ${((end - start) / 1000).toFixed(2)}s`);
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
