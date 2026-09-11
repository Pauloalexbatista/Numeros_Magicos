import { PrismaClient } from '@prisma/client';
import { rankedSystems, getSystemByName } from './ranked-systems';
// import { evaluateSystem, updateRanking } from './ranking-evaluator';

const prisma = new PrismaClient();

/**
 * Backfills history for a specific system or all systems.
 * @param targetSystemName Optional. If provided, only backfills for this system.
 */
export async function backfillHistory(targetSystemName?: string) {
    console.log(`🚀 Starting Backfill Process${targetSystemName ? ` for ${targetSystemName}` : ''}...`);

    try {
        // 1. Fetch all draws ordered by date (Oldest first)
        const allDraws = await prisma.draw.findMany({
            orderBy: { date: 'asc' }
        });

        console.log(`📚 Found ${allDraws.length} total draws.`);

        if (allDraws.length < 100) {
            console.warn('⚠️ Not enough draws to perform backfill (need at least 100).');
            return;
        }

        // 2. Start from index 100 (Draw #101)
        const START_INDEX = 100;
        const drawsToAnalyze = allDraws.slice(START_INDEX);

        console.log(`🔬 Analyzing ${drawsToAnalyze.length} draws (starting from index ${START_INDEX})...`);

        // 3. Determine systems to analyze
        let systemsToAnalyze = rankedSystems;
        if (targetSystemName) {
            const system = getSystemByName(targetSystemName);
            if (!system) {
                throw new Error(`System ${targetSystemName} not found in registry.`);
            }
            systemsToAnalyze = [system];
        }

        console.log(`🤖 Systems to analyze: ${systemsToAnalyze.map(s => s.name).join(', ')}`);

        let totalPredictions = 0;

        // 4. Iterate through history
        for (let i = 0; i < drawsToAnalyze.length; i++) {
            const currentDraw = drawsToAnalyze[i];
            const currentIndex = START_INDEX + i;

            // Get history up to this draw (exclusive, newest first)
            const history = allDraws.slice(0, currentIndex).reverse();

            // process.stdout.write(`\r⏳ Processing Draw ${currentDraw.id} (${i + 1}/${drawsToAnalyze.length})...`);

            for (const system of systemsToAnalyze) {
                try {
                    // Check if performance already exists
                    const existing = await (prisma as any).systemPerformance.findFirst({
                        where: {
                            drawId: currentDraw.id,
                            systemName: system.name
                        }
                    });

                    if (existing) {
                        continue;
                    }

                    // Generate Prediction
                    const top10 = await system.generateTop10(history);

                    // Evaluate
                    // Evaluate
                    const hits = currentDraw.numbers ? JSON.parse(currentDraw.numbers).filter((n: number) => top10.includes(n)).length : 0;
                    const accuracy = (hits / 5) * 100;

                    // Save
                    await (prisma as any).systemPerformance.create({
                        data: {
                            drawId: currentDraw.id,
                            systemName: system.name,
                            predictedNumbers: JSON.stringify(top10),
                            actualNumbers: currentDraw.numbers,
                            hits,
                            accuracy,
                            createdAt: new Date(currentDraw.date) // Simulate historical creation time
                        }
                    });

                    totalPredictions++;

                } catch (err) {
                    console.error(`\n❌ Error processing ${system.name} for draw ${currentDraw.id}:`, err);
                }
            }
        }

        console.log(`\n\n✅ Backfill complete! Generated ${totalPredictions} predictions.`);

        // 5. Update Rankings
        console.log('📊 Updating final rankings...');
        // await updateRanking();
        console.log('✨ Done.');

    } catch (error) {
        console.error('❌ Fatal error in backfill:', error);
        throw error;
    }
}
