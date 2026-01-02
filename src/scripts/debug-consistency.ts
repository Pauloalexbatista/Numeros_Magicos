
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkConsistency() {
    console.log('Dumping data for Draws 1903-1907...');
    const systemName = 'LSTM Neural Net';

    const draws = [1903, 1904, 1905, 1906, 1907];
    for (const drawId of draws) {
        const perf = await prisma.systemPerformance.findFirst({
            where: { drawId, systemName },
            include: { draw: true }
        });

        if (perf && perf.predictedNumbers) {
            const nums = JSON.parse(perf.predictedNumbers as string);
            console.log(`[DRAW ${drawId}] (${perf.draw.date.toISOString().split('T')[0]}) Performance: ${nums.slice(0, 15).join(', ')}`);
        } else {
            console.log(`[DRAW ${drawId}] Performance: NOT FOUND`);
        }

        const pred = await prisma.systemPrediction.findFirst({
            where: { drawId, systemName }
        });
        if (pred) {
            const nums = JSON.parse(pred.prediction as string);
            console.log(`[DRAW ${drawId}] Prediction : ${nums.slice(0, 15).join(', ')}`);
        } else {
            console.log(`[DRAW ${drawId}] Prediction : NOT FOUND`);
        }
        console.log('---');
    }
}

checkConsistency()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
