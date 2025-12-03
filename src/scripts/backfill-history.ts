import { PrismaClient } from '@prisma/client';
import { rankedSystems } from '../services/ranked-systems';
import { evaluateSystem, updateRanking } from '../services/ranking-evaluator';

const prisma = new PrismaClient();

async function backfillHistory() {
    console.log('🚀 Starting Backfill Process...');

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

        // 1.5 Clear ONLY Ensemble Voting performance data to test improvement
        console.log('🧹 Clearing Ensemble Voting performance data...');
        await prisma.systemPerformance.deleteMany({
            where: { systemName: 'Ensemble Voting' }
        });
        console.log('✅ Ensemble data cleared.');

        // 2. Start from index 100 (Draw #101)
        // We need at least 100 previous draws to feed the algorithms
        const START_INDEX = 100;
        const drawsToAnalyze = allDraws.slice(START_INDEX);

        console.log(`🔬 Analyzing ${drawsToAnalyze.length} draws (starting from index ${START_INDEX})...`);

        // 3. Get active systems
        // Ensure all systems are registered in DB
        console.log('📝 Registering systems in database...');
        for (const system of rankedSystems) {
            await prisma.rankedSystem.upsert({
                where: { name: system.name },
                update: { description: system.description },
                create: {
                    name: system.name,
                    description: system.description,
                    isActive: true
                }
            });
        }
        console.log(`🤖 Systems to analyze: ${rankedSystems.map(s => s.name).join(', ')}`);

        let totalPredictions = 0;

        // 4. Iterate through history
        for (let i = 0; i < drawsToAnalyze.length; i++) {
            const currentDraw = drawsToAnalyze[i];
            const currentIndex = START_INDEX + i;

            // Get history up to this draw (exclusive)
            // We need them in DESC order for the algorithms usually (newest first)
            // But our allDraws is ASC. So we slice 0..currentIndex and reverse.
        }

        // Filter to only run LSTM Neural Net for verification
        const systemsToAnalyze = rankedSystems.filter(s => s.name === 'LSTM Neural Net');
        console.log(`🤖 Systems to analyze: ${systemsToAnalyze.map(s => s.name).join(', ')}`);

        // let totalPredictions = 0; // Already declared above

        // 4. Iterate through history
        for (let i = 0; i < drawsToAnalyze.length; i++) {
            const currentDraw = drawsToAnalyze[i];
            const currentIndex = START_INDEX + i;

            // Get history up to this draw (exclusive)
            const history = allDraws.slice(0, currentIndex).reverse();

            process.stdout.write(`\r⏳ Processing Draw ${currentDraw.id} (${i + 1}/${drawsToAnalyze.length})...`);

            for (const system of systemsToAnalyze) {
                try {
                    // Check if performance already exists to avoid duplicates?
                    // For backfill, we might want to overwrite or skip.
                    // Let's check first.
                    const existing = await prisma.systemPerformance.findFirst({
                        where: {
                            drawId: currentDraw.id,
                            systemName: system.name
                        }
                    });

                    if (existing) {
                        // Skip if already exists
                        continue;
                    }

                    // Generate Prediction
                    // Note: Algorithms expect draws in some order. 
                    // Usually "generateTop10" implies looking at past data.
                    // Let's assume they handle the array correctly if we pass "history" (newest first).
                    const top10 = await system.generateTop10(history);

                    // Evaluate
                    const { hits, accuracy } = await evaluateSystem(
                        system.name,
                        top10,
                        currentDraw
                    );

                    // Save
                    await prisma.systemPerformance.create({
                        data: {
                            drawId: currentDraw.id,
                            systemName: system.name,
                            predictedNumbers: JSON.stringify(top10),
                            actualNumbers: currentDraw.numbers, // Already a JSON string in Draw model
                            hits,
                            accuracy,
                            createdAt: new Date(currentDraw.date)
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
        await updateRanking();
        console.log('✨ Done.');

    } catch (error) {
        console.error('❌ Fatal error in backfill:', error);
    } finally {
        await prisma.$disconnect();
    }
}

backfillHistory();
