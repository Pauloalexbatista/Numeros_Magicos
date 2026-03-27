
import { prisma } from '../lib/prisma';
import { QuartetoEliteSystem } from '../systems/ensemble/QuartetoEliteSystem';
import { SystemPerformance } from '@prisma/client';

async function main() {
    console.log("🚀 FORCING QUARTETO ELITE RECALCULATION...");

    // 1. Get recent draws
    const draws = await prisma.draw.findMany({
        orderBy: { date: 'desc' },
        take: 5
    });

    const quarteto = new QuartetoEliteSystem();
    const sysName = quarteto.metadata.name; // "Quarteto Elite (LSTM + Media3 + RF + SemPontas)"

    for (const draw of draws) {
        console.log(`\nProcessing Draw: ${draw.date.toISOString().split('T')[0]} (ID: ${draw.id})`);

        // 2. Calculate Prediction
        // We need history UP TO this draw (excluding future)
        const history = await prisma.draw.findMany({
            where: { date: { lt: draw.date } },
            orderBy: { date: 'desc' },
            take: 100
        });

        try {
            console.log("  🧠 Generating prediction...");
            const prediction = await quarteto.predict(history);
            const predictedNumbers = prediction.numbers;

            // 3. Calculate Hits
            const actualNumbers = (typeof draw.numbers === "string" ? JSON.parse(draw.numbers) : draw.numbers);
            const hits = predictedNumbers.filter((n: number) => actualNumbers.includes(n)).length;

            console.log(`  🎯 Prediction: [${predictedNumbers.slice(0, 5)}...] | Hits: ${hits}`);

            // 4. Upsert into DB
            await prisma.systemPerformance.upsert({
                where: {
                    drawId_systemName: {
                        drawId: draw.id,
                        systemName: sysName
                    }
                },
                update: {
                    predictedNumbers: JSON.stringify(predictedNumbers),
                    actualNumbers: draw.numbers,
                    hits: hits,
                    accuracy: (hits / 5) * 100 // Approximation
                },
                create: {
                    drawId: draw.id,
                    systemName: sysName,
                    predictedNumbers: JSON.stringify(predictedNumbers),
                    actualNumbers: draw.numbers,
                    hits: hits,
                    accuracy: (hits / 5) * 100
                }
            });
            console.log("  ✅ Saved to DB!");

        } catch (error) {
            console.error("  ❌ Error calculating:", error);
        }
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
