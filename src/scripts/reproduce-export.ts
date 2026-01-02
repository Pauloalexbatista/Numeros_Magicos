
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function reproduceExport() {
    console.log('Reproducing Export Logic for LSTM Neural Net - DATE BASED LOGIC...');

    // 1. Fetch Drawings (Same as route)
    const draws = await prisma.draw.findMany({
        orderBy: { date: 'desc' },
        take: 10
    });

    console.log(`Fetched ${draws.length} draws. Top: ID ${draws[0].id} Date ${draws[0].date.toISOString()}`);

    const systemName = 'LSTM Neural Net';

    for (const draw of draws) {
        // Reproduce Made Prediction (Left Column)
        const prediction = await prisma.systemPerformance.findFirst({
            where: { drawId: draw.id, systemName }
        });

        let leftNums = 'NOT FOUND';
        if (prediction && prediction.predictedNumbers) {
            const nums = JSON.parse(prediction.predictedNumbers as string);
            leftNums = nums.slice(0, 5).join(', ');
        }

        // Reproduce Next Prediction (Right Column) - DATE BASED
        const nextDraw = await prisma.draw.findFirst({
            where: { date: { gt: draw.date } },
            orderBy: { date: 'asc' }
        });

        let nextDrawId = 'NONE';
        let rightNums = 'NOT FOUND';

        if (nextDraw) {
            nextDrawId = nextDraw.id.toString();
            const nextPrediction = await prisma.systemPerformance.findFirst({
                where: { drawId: nextDraw.id, systemName }
            });

            if (nextPrediction && nextPrediction.predictedNumbers) {
                const nums = JSON.parse(nextPrediction.predictedNumbers as string);
                rightNums = nums.slice(0, 5).join(', ');
            }
        }

        console.log(`Row Draw ${draw.id} (${draw.date.toISOString().split('T')[0]}) | Left (Made): ${leftNums} | Right (Next For ${nextDrawId}): ${rightNums}`);
    }
}

reproduceExport()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
