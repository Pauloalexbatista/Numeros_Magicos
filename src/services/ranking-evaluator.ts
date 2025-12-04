import { PrismaClient, Draw } from '@prisma/client';
import { rankedSystems, getSystemByName } from './ranked-systems';

const prisma = new PrismaClient();

/**
 * Evaluate a system's prediction against actual draw
 */
export async function evaluateSystem(
    systemName: string,
    predictedTop10: number[],
    actualDraw: Draw
): Promise<{
    hits: number;
    accuracy: number;
}> {
    const actualNumbers = JSON.parse(actualDraw.numbers) as number[];

    // Count how many predicted numbers appeared
    const hits = actualNumbers.filter(n => predictedTop10.includes(n)).length;

    // Calculate accuracy percentage
    const accuracy = (hits / 5) * 100;

    return { hits, accuracy };
}

/**
 * Trigger: Called when a new draw is added
 * Evaluates all active systems and records performance
 */
export async function onNewDrawAdded(newDraw: Draw) {
    console.log(`🎯 Evaluating systems for draw ${newDraw.id}...`);

    try {
        // Get all draws for analysis (ordered by date desc)
        const allDraws = await prisma.draw.findMany({
            orderBy: { date: 'desc' }
        });

        // Use last 100 for predictions (excluding the new one)
        const last100 = allDraws.slice(1, 101);

        // Get active systems from DB
        const activeSystems = await prisma.rankedSystem.findMany({
            where: { isActive: true }
        });

        for (const dbSystem of activeSystems) {
            const system = getSystemByName(dbSystem.name);
            if (!system) {
                console.warn(`⚠️ System ${dbSystem.name} not found in registry`);
                continue;
            }

            try {
                // Generate Top 10 prediction
                const top10 = await system.generateTop10(last100);

                // Evaluate against actual draw
                const { hits, accuracy } = await evaluateSystem(
                    system.name,
                    top10,
                    newDraw
                );

                // Check if performance already exists
                const existingPerf = await prisma.systemPerformance.findFirst({
                    where: {
                        drawId: newDraw.id,
                        systemName: system.name
                    }
                });

                if (existingPerf) {
                    console.log(`ℹ️ Performance for ${system.name} on draw ${newDraw.id} already exists. Skipping.`);
                    continue;
                }

                // Save performance
                await prisma.systemPerformance.create({
                    data: {
                        drawId: newDraw.id,
                        systemName: system.name,
                        predictedNumbers: JSON.stringify(top10),
                        actualNumbers: newDraw.numbers,
                        hits,
                        accuracy
                    }
                });

                console.log(`✅ ${system.name}: ${hits}/5 hits (${accuracy.toFixed(1)}%)`);
            } catch (error) {
                console.error(`❌ Error evaluating ${dbSystem.name}:`, error);
            }
        }

        // Update rankings
        await updateRanking();

        console.log('✅ All systems evaluated successfully!');
    } catch (error) {
        console.error('❌ Error in onNewDrawAdded:', error);
        throw error;
    }
}

/**
 * Recalculate ranking based on last 100 performances
 */
export async function updateRanking() {
    console.log('📊 Updating rankings...');

    const systems = await prisma.rankedSystem.findMany({
        where: { isActive: true }
    });

    for (const system of systems) {
        // Get last 100 performances
        const last100Performances = await prisma.systemPerformance.findMany({
            where: { systemName: system.name },
            orderBy: { createdAt: 'desc' },
            take: 100
        });

        if (last100Performances.length === 0) {
            console.log(`⚠️ ${system.name}: No performances yet`);
            continue;
        }

        // Calculate average accuracy
        const avgAccuracy =
            last100Performances.reduce((sum, p) => sum + p.accuracy, 0) /
            last100Performances.length;

        // Upsert ranking
        await prisma.systemRanking.upsert({
            where: { systemName: system.name },
            update: {
                avgAccuracy,
                totalPredictions: last100Performances.length,
                lastUpdated: new Date()
            },
            create: {
                systemName: system.name,
                avgAccuracy,
                totalPredictions: last100Performances.length
            }
        });

        console.log(`✅ ${system.name}: ${avgAccuracy.toFixed(2)}% (${last100Performances.length} predictions)`);
    }

    console.log('✅ Rankings updated!');
}

/**
 * Get current ranking
 */
export async function getRanking() {
    return await prisma.systemRanking.findMany({
        include: {
            system: true
        },
        orderBy: { avgAccuracy: 'desc' }
    });
}

/**
 * Get system performance history
 */
export async function getSystemPerformance(systemName: string, limit: number = 100) {
    return await prisma.systemPerformance.findMany({
        where: { systemName },
        include: { draw: true },
        orderBy: { createdAt: 'desc' },
        take: limit
    });
}

/**
 * Calculate baseline (random selection)
 */
export function calculateRandomBaseline(): number {
    // Probability of hitting with random selection
    // 10 numbers out of 50, need to hit 5
    // Expected hits = (10/50) * 5 = 1
    // Accuracy = (1/5) * 100 = 20%
    return 20.0;
}
