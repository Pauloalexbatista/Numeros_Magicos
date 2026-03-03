
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkStatus() {
    const games = ['EUROMILLIONS', 'TOTOLOTO', 'EURODREAMS'];

    for (const game of games) {
        console.log(`\n--- Game: ${game} ---`);

        // 1. Latest Draw
        const lastDraw = await prisma.draw.findFirst({
            where: { game },
            orderBy: { date: 'desc' }
        });

        if (!lastDraw) {
            console.log("No draws found.");
            continue;
        }

        console.log(`Latest Draw: ${lastDraw.date.toISOString().split('T')[0]} (ID: ${lastDraw.id})`);
        console.log(`Numbers: ${lastDraw.numbers}`);

        // 2. Predictions for Latest Draw
        const predictionCount = await prisma.systemPrediction.count({
            where: { drawId: lastDraw.id }
        });
        console.log(`Total Predictions for Draw ${lastDraw.id}: ${predictionCount}`);

        // 3. Sample Prediction Size
        const samplePred = await prisma.systemPrediction.findFirst({
            where: { drawId: lastDraw.id }
        });

        if (samplePred) {
            const numbers = JSON.parse(samplePred.prediction as string);
            console.log(`Sample Prediction Size: ${numbers.length}`);
            console.log(`Sample Prediction Numbers: ${numbers}`);
        } else {
            console.log("No predictions found for latest draw.");
            // Try finding the previous draw to check size
            const prevPred = await prisma.systemPrediction.findFirst({
                where: { draw: { game: game } },
                orderBy: { draw: { date: 'desc' } }
            });
            if (prevPred) {
                const numbers = JSON.parse(prevPred.prediction as string);
                console.log(`[Previous Draw] Sample Prediction Size: ${numbers.length}`);
            }
        }

        // 4. Rankings for Latest Draw
        try {
            const rankingCount = await prisma.systemRanking.count({
                where: { system: { game: game } } // Correct relation filter if needed, or just remove where if checking all
            });
            console.log(`Total Rankings for ${game}: ${rankingCount}`);
        } catch (e) {
            console.log("Could not count rankings: " + e.message);
        }
    }
}

checkStatus()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
