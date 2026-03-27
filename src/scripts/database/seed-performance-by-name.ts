
import { prisma } from '@/lib/prisma';
import { rankedSystems } from '@/services/ranked-systems';

// We want to process ALL draws to restore "Liga dos Campeões" (Yearly Stats)
// But we process in chunks to manage memory
const CHUNK_SIZE = 100;

async function seedPerformanceByName(targetSystemName: string) {
    // Find system
    const system = rankedSystems.find(s => s.name === targetSystemName);
    if (!system) {
        console.error(`❌ System "${targetSystemName}" not found!`);
        return;
    }

    console.log(`📜 SEEDING FULL HISTORY: ${system.name}`);
    console.log('═'.repeat(60));

    // Get ALL draws (ordered by date)
    const allDraws = await prisma.draw.findMany({
        orderBy: { date: 'asc' }
    });

    console.log(`📚 Total Draws available: ${allDraws.length}`);

    // We need at least 10-20 draws of history to start predicting
    const START_INDEX = 20;

    // Draws we will actually predict for
    const drawsToPredict = allDraws.slice(START_INDEX);
    console.log(`🎯 Will calculate performance for ${drawsToPredict.length} draws...`);

    let processed = 0;
    let newRecords = 0;

    // Process in chunks to avoid blowing up memory with massive "history" arrays if we aren't careful?
    // Actually, `generateTop10` usually takes the *entire* preceding history.
    // So as we advance, the history array gets larger (up to 1900 items).
    // JS can handle 2000 items easily.

    // Optimization: If it's an "Anti-" system, we can reuse the Base system's prediction from DB
    // instead of re-running the heavy model (especially for LSTM).
    const isAntiSystem = system.name.startsWith('Anti-');
    const baseSystemName = isAntiSystem ? system.name.substring(5) : '';

    for (const draw of drawsToPredict) {
        // Check if already exists
        const existing = await prisma.systemPerformance.findFirst({
            where: {
                drawId: draw.id,
                systemName: system.name
            },
            select: { id: true }
        });

        if (existing) {
            continue;
        }

        let prediction: number[] = [];

        try {
            // OPTIMIZATION: Try to get Base System prediction from DB first
            if (isAntiSystem) {
                const basePerformance = await prisma.systemPerformance.findFirst({
                    where: {
                        drawId: draw.id,
                        systemName: baseSystemName
                    },
                    select: { predictedNumbers: true }
                });

                if (basePerformance) {
                    // Found cached base prediction! Invert it!
                    const basePred = JSON.parse(basePerformance.predictedNumbers) as number[];
                    const allNumbers = Array.from({ length: 50 }, (_, i) => i + 1);
                    const inverseNumbers = allNumbers.filter(n => !basePred.includes(n));
                    prediction = inverseNumbers.slice(0, 25);
                }
            }

            // Fallback: If no optimization or base not found, run normal generation
            if (prediction.length === 0) {
                const drawIndex = allDraws.findIndex(d => d.id === draw.id);
                const history = allDraws.slice(0, drawIndex);
                const historyDesc = [...history].reverse(); // Newest first
                prediction = await system.generateTop10(historyDesc as any[]);
            }

            // Calculate Accuracy
            const actualNumbers = typeof draw.numbers === 'string'
                ? (typeof draw.numbers === "string" ? JSON.parse(draw.numbers) : draw.numbers)
                : draw.numbers;

            const hits = actualNumbers.filter((n: number) => prediction.includes(n)).length;
            const accuracy = (hits / 5) * 100;

            await prisma.systemPerformance.create({
                data: {
                    drawId: draw.id,
                    systemName: system.name,
                    predictedNumbers: JSON.stringify(prediction),
                    actualNumbers: draw.numbers,
                    hits,
                    accuracy
                }
            });
            newRecords++;

        } catch (error) {
            console.error(`❌ Error draw ${draw.id}:`, error);
        }

        processed++;
        if (processed % 50 === 0) {
            const year = draw.date.getFullYear();
            process.stdout.write(` [${year}]`);
        }
    }

    console.log(`\n✅ ${system.name}: Analyzed ${processed} draws, Added ${newRecords} records.`);
}

export { seedPerformanceByName };
