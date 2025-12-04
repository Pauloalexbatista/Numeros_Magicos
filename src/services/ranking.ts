import { prisma } from '@/lib/prisma';
import { rankedSystems } from './ranked-systems';
import { Draw } from '@prisma/client';

/**
 * Initialize all systems in the database
 */
export async function initializeSystems() {
    for (const system of rankedSystems) {
        await prisma.rankedSystem.upsert({
            where: { name: system.name },
            update: {
                description: system.description
            },
            create: {
                name: system.name,
                description: system.description,
                isActive: true
            }
        });
    }
}

/**
 * Evaluate a specific draw for all active systems
 * This effectively "backtests" the draw if it's in the past,
 * or evaluates a real prediction if we had stored it (but here we generate on fly for simplicity)
 */
export async function evaluateDraw(drawId: number) {
    const draw = await prisma.draw.findUnique({
        where: { id: drawId },
        include: { systemPerformances: true }
    });

    if (!draw) throw new Error(`Draw ${drawId} not found`);

    // Get history BEFORE this draw
    const history = await prisma.draw.findMany({
        where: {
            date: {
                lt: draw.date
            }
        },
        orderBy: {
            date: 'desc' // Newest first, as expected by some models? 
            // Check types.ts: "chronological order: oldest first, newest last" is common for ML
            // But ranked-systems.ts implementations seem to handle arrays.
            // Let's check RandomModel.ts or others. 
            // Most implementations in ranked-systems.ts iterate.
            // Let's provide DESC (newest first) as it's easier to slice "recent history".
        }
    });

    // NOTE: Some models might expect ASC order. 
    // Let's check `ranked-systems.ts` implementations.
    // `generateHotNumbers`: iterates all. Order doesn't matter.
    // `generateMarkovChain`: uses `draws[0]` as last draw. So it expects DESC (newest at 0).
    // `generateMonteCarlo`: iterates all.
    // `generateClustering`: iterates all.
    // So DESC (newest first) seems correct for `ranked-systems.ts`.

    const actualNumbers = JSON.parse(draw.numbers) as number[];

    for (const system of rankedSystems) {
        // Check if we already have performance for this system/draw
        const existingPerf = draw.systemPerformances.find(p => p.systemName === system.name);
        if (existingPerf) continue; // Already evaluated

        // Generate prediction
        // We pass the history. 
        // IMPORTANT: The system needs to be robust enough to handle history.
        const predictedNumbers = await system.generateTop10(history);

        // Calculate hits (compare Top 10 vs Actual 5)
        const hits = actualNumbers.filter(n => predictedNumbers.includes(n)).length;

        // Accuracy: Hits / 5 (since we want to know how many of the winning numbers we found)
        // Or Hits / PredictionSize? 
        // Usually "Coverage": How many of the 5 winning numbers are in our Top 10?
        // If we find 5 winning numbers in our Top 10, that's 100% success for the user.
        const accuracy = (hits / 5) * 100;

        // Save performance
        await prisma.systemPerformance.create({
            data: {
                drawId: draw.id,
                systemName: system.name,
                predictedNumbers: JSON.stringify(predictedNumbers),
                actualNumbers: draw.numbers,
                hits,
                accuracy
            }
        });
    }
}

/**
 * Update the global ranking table based on recent performance
 */
export async function updateRanking() {
    const systems = await prisma.rankedSystem.findMany({
        where: { isActive: true }
    });

    for (const system of systems) {
        // Get last 100 performances
        const performances = await prisma.systemPerformance.findMany({
            where: { systemName: system.name },
            orderBy: { draw: { date: 'desc' } },
            take: 100
        });

        if (performances.length === 0) continue;

        const totalAccuracy = performances.reduce((sum, p) => sum + p.accuracy, 0);
        const avgAccuracy = totalAccuracy / performances.length;

        await prisma.systemRanking.upsert({
            where: { systemName: system.name },
            update: {
                avgAccuracy,
                totalPredictions: performances.length,
                lastUpdated: new Date()
            },
            create: {
                systemName: system.name,
                avgAccuracy,
                totalPredictions: performances.length
            }
        });
    }
}

/**
 * Run a full backfill for the last N draws
 */
import { processInBatches } from '@/utils/batch-processor';

/**
 * Run a full backfill for the last N draws
 */
export async function backfillRankings(limit: number = 50) {
    await initializeSystems();

    // Get last N draws
    const draws = await prisma.draw.findMany({
        orderBy: { date: 'desc' },
        take: limit
    });

    // Process from oldest to newest within the limit
    const sortedDraws = draws.reverse();

    console.log(`Starting backfill for ${sortedDraws.length} draws...`);

    // Use batch processing: 5 draws at a time, 100ms delay between batches
    // This prevents blocking the main thread for too long
    await processInBatches(
        sortedDraws,
        5,
        async (draw) => {
            console.log(`Evaluating draw ${draw.id} (${draw.date.toISOString().split('T')[0]})...`);
            await evaluateDraw(draw.id);
        },
        (processed, total) => {
            console.log(`Progress: ${processed}/${total} draws processed`);
        },
        100 // 100ms delay to let other tasks breathe
    );

    console.log('Updating rankings...');
    await updateRanking();

    console.log('Caching future predictions...');
    await cachePredictions();

    console.log('Backfill complete.');
}

/**
 * Generate and cache predictions for the NEXT draw for all active systems
 */
export async function cachePredictions() {
    // Get all active systems
    const systems = rankedSystems; // Use the imported list directly to ensure we have the classes

    // Get full history
    const history = await prisma.draw.findMany({
        orderBy: { date: 'desc' }
    });

    console.log(`Generating cached predictions based on ${history.length} draws...`);

    for (const [index, system] of systems.entries()) {
        try {
            const sysStart = performance.now();
            process.stdout.write(`[${index + 1}/${systems.length}] Caching ${system.name}... `);

            // Generate prediction for next draw
            const prediction = await system.generateTop10(history);

            // Calculate "Worst 25"
            const allNumbers = Array.from({ length: 50 }, (_, i) => i + 1);
            const worstNumbers = allNumbers.filter(n => !prediction.includes(n));

            // Save to Cache
            await prisma.cachedPrediction.upsert({
                where: { systemName: system.name },
                update: {
                    numbers: JSON.stringify(prediction),
                    worstNumbers: JSON.stringify(worstNumbers),
                    updatedAt: new Date()
                },
                create: {
                    systemName: system.name,
                    numbers: JSON.stringify(prediction),
                    worstNumbers: JSON.stringify(worstNumbers)
                }
            });

            const sysEnd = performance.now();
            console.log(`✅ ${(sysEnd - sysStart).toFixed(0)}ms`);

        } catch (error) {
            console.error(`❌ Failed:`, error);
        }
    }
}

/**
 * Evaluate a specific draw for all active systems (STAGING MODE)
 * Writes to SystemPerformanceStaging table
 */
export async function evaluateDrawStaging(drawId: number) {
    const draw = await prisma.draw.findUnique({
        where: { id: drawId },
        include: { stagingPerformances: true }
    });

    if (!draw) throw new Error(`Draw ${drawId} not found`);

    // Get history BEFORE this draw
    const history = await prisma.draw.findMany({
        where: {
            date: {
                lt: draw.date
            }
        },
        orderBy: {
            date: 'desc'
        }
    });

    const actualNumbers = JSON.parse(draw.numbers) as number[];

    for (const system of rankedSystems) {
        // Check if we already have performance for this system/draw
        const existingPerf = draw.stagingPerformances.find(p => p.systemName === system.name);
        if (existingPerf) continue; // Already evaluated

        // Generate prediction
        const predictedNumbers = await system.generateTop10(history);

        // Calculate hits (compare Top 10 vs Actual 5)
        const hits = actualNumbers.filter(n => predictedNumbers.includes(n)).length;
        const accuracy = (hits / 5) * 100;

        // Save performance to STAGING
        await prisma.systemPerformanceStaging.create({
            data: {
                drawId: draw.id,
                systemName: system.name,
                predictedNumbers: JSON.stringify(predictedNumbers),
                actualNumbers: draw.numbers,
                hits,
                accuracy
            }
        });
    }
}
