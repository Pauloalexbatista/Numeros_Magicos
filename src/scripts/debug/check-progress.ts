
import { prisma } from '@/lib/prisma';

async function main() {
    const count = await prisma.systemPerformance.count({
        where: { drawId: 1919 }
    });
    console.log(`System Performances for Draw 1919: ${count}`);

    const predictions = await prisma.cachedPrediction.count();
    console.log(`Cached Predictions: ${predictions}`);
}

main();
