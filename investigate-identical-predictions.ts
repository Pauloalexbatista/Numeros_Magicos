import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function investigateIdenticalPredictions() {
    const systemName = 'Vortex Multi-Canal (2 canais)';

    console.log('🔍 INVESTIGATING IDENTICAL PREDICTIONS');
    console.log('═'.repeat(80));
    console.log();

    // Get predictions for draws 1896-1905
    const predictions = await prisma.systemPrediction.findMany({
        where: {
            systemName,
            drawId: { gte: 1896, lte: 1905 }
        },
        orderBy: { drawId: 'asc' },
        select: {
            drawId: true,
            prediction: true,
            calculatedAt: true
        }
    });

    console.log(`Found ${predictions.length} predictions\n`);

    // Compare predictions
    for (let i = 0; i < predictions.length; i++) {
        const pred = predictions[i];
        const numbers = JSON.parse(pred.prediction);

        console.log(`Draw ${pred.drawId}:`);
        console.log(`  Calculated: ${pred.calculatedAt.toLocaleString('pt-PT')}`);
        console.log(`  Numbers: ${numbers.slice(0, 25).join(',')}`);

        if (i > 0) {
            const prevNumbers = JSON.parse(predictions[i - 1].prediction);
            const identical = numbers.slice(0, 25).every((n: number, idx: number) => n === prevNumbers[idx]);
            const similarCount = numbers.slice(0, 25).filter((n: number) => prevNumbers.includes(n)).length;

            console.log(`  vs Previous: ${identical ? '❌ IDENTICAL!' : `✓ Different (${similarCount}/25 same numbers)`}`);
        }
        console.log();
    }

    // Check if there's an issue with the incremental update logic
    console.log('═'.repeat(80));
    console.log('🔍 CHECKING LAST PROCESSED DRAW ID');
    console.log('═'.repeat(80));
    console.log();

    const lastPerf = await prisma.systemPerformance.findFirst({
        where: { systemName },
        orderBy: { drawId: 'desc' },
        select: { drawId: true }
    });

    console.log(`Last SystemPerformance draw ID: ${lastPerf?.drawId || 'None'}`);

    const lastPred = await prisma.systemPrediction.findFirst({
        where: { systemName },
        orderBy: { drawId: 'desc' },
        select: { drawId: true }
    });

    console.log(`Last SystemPrediction draw ID: ${lastPred?.drawId || 'None'}`);
    console.log();

    await prisma.$disconnect();
}

investigateIdenticalPredictions().catch(console.error);
