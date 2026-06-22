import { prisma } from '@/lib/prisma';
import { Draw } from '@prisma/client';
import { rankedSystems, getSystemByName } from './ranked-systems';

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
    const actualNumbers = (typeof actualDraw.numbers === "string" ? (typeof actualDraw.numbers === "string" ? JSON.parse(actualDraw.numbers) : actualDraw.numbers) : actualDraw.numbers) as number[];

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
    console.log(`YZ Evaluating systems for draw ${newDraw.id}...`);

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
                console.warn(`s? System ${dbSystem.name} not found in registry`);
                continue;
            }

            try {
                // Generate Full Pool (50 numbers)
                const fullPool = await system.generateTop10(last100, true);
                const top25 = fullPool.slice(0, 25);

                // Evaluate against actual draw using top 25 (standard for legacy SystemPerformance)
                const { hits, accuracy } = await evaluateSystem(
                    system.name,
                    top25,
                    newDraw
                );

                // Check if performance already exists in SystemPerformance
                const existingPerf = await prisma.systemPerformance.findFirst({
                    where: {
                        drawId: newDraw.id,
                        systemName: system.name
                    }
                });

                if (!existingPerf) {
                    // Save performance (legacy)
                    await prisma.systemPerformance.create({
                        data: {
                            drawId: newDraw.id,
                            systemName: system.name,
                            predictedNumbers: JSON.stringify(top25),
                            actualNumbers: newDraw.numbers,
                            hits,
                            accuracy
                        }
                    });
                }

                // Also save to SystemPerformanceFullPool
                const existingFull = await prisma.systemPerformanceFullPool.findFirst({
                    where: {
                        drawId: newDraw.id,
                        systemName: system.name,
                        game: newDraw.game || 'EUROMILLIONS'
                    }
                });

                if (!existingFull) {
                    await prisma.systemPerformanceFullPool.create({
                        data: {
                            drawId: newDraw.id,
                            game: newDraw.game || 'EUROMILLIONS',
                            systemName: system.name,
                            predictedNumbers: JSON.stringify(fullPool),
                            actualNumbers: newDraw.numbers
                        }
                    });
                }

                console.log(`o. ${system.name}: ${hits}/5 hits (${accuracy.toFixed(1)}%) saved to both DBs`);
            } catch (error) {
                console.error(`?O Error evaluating ${dbSystem.name}:`, error);
            }
        }

        // Update rankings
        await updateRanking();

        console.log('o. All systems evaluated successfully!');
    } catch (error) {
        console.error('?O Error in onNewDrawAdded:', error);
        throw error;
    }
}

/**
 * Recalculate ranking based on last 100 performances
 */
export async function updateRanking(game: string = 'EUROMILLIONS') {
    console.log(`Y"S Updating rankings for ${game}...`);

    const systems = await prisma.rankedSystem.findMany({
        where: { isActive: true, game }
    });

    for (const system of systems) {
        // Get last 100 performances for this game from FullPool
        const last100Performances = await prisma.systemPerformanceFullPool.findMany({
            where: { systemName: system.name, draw: { game } },
            orderBy: { createdAt: 'desc' },
            take: 100
        });

        if (last100Performances.length === 0) {
            console.log(`s? ${system.name}: No performances yet`);
            continue;
        }

        // Calculate average accuracy based on Top 25
        let totalAccuracy = 0;
        for (const p of last100Performances) {
             const predArr = typeof p.predictedNumbers === 'string' ? JSON.parse(p.predictedNumbers) : p.predictedNumbers;
             const actualArr = typeof p.actualNumbers === 'string' ? JSON.parse(p.actualNumbers) : p.actualNumbers;
             const top25 = predArr.slice(0, 25);
             const hits = actualArr.filter((n: number) => top25.includes(n)).length;
             totalAccuracy += (hits / 5) * 100;
        }

        const avgAccuracy = totalAccuracy / last100Performances.length;

        // Upsert ranking with compound key
        await prisma.systemRanking.upsert({
            where: {
                systemName_game: {
                    systemName: system.name,
                    game
                }
            } as any,
            update: {
                avgAccuracy,
                totalPredictions: last100Performances.length,
                lastUpdated: new Date()
            },
            create: {
                systemName: system.name,
                game,
                avgAccuracy,
                totalPredictions: last100Performances.length
            } as any
        });

        console.log(`o. ${system.name}: ${avgAccuracy.toFixed(2)}% (${last100Performances.length} predictions)`);
    }

    console.log('o. Rankings updated!');
}
/**
 * Get current ranking
 */
export async function getRanking(game: string = 'EUROMILLIONS') {
    const where = game ? { game } : {};
    return await prisma.systemRanking.findMany({
        where,
        include: {
            system: true
        },
        orderBy: { avgAccuracy: 'desc' }
    });
}

/**
 * Get system performance history
 */
export async function getSystemPerformance(systemName: string, limit: number = 100, game?: string) {
    const where: any = { systemName };
    if (game) {
        where.game = game.toUpperCase();
    }
    const perfs = await prisma.systemPerformanceFullPool.findMany({
        where,
        include: { draw: true },
        orderBy: { createdAt: 'desc' },
        take: limit
    });
    
    return perfs.map(p => {
         const predArr = typeof p.predictedNumbers === 'string' ? JSON.parse(p.predictedNumbers) : p.predictedNumbers;
         const actualArr = typeof p.actualNumbers === 'string' ? JSON.parse(p.actualNumbers) : p.actualNumbers;
         const top25 = predArr.slice(0, 25);
         const hits = actualArr.filter((n: number) => top25.includes(n)).length;
         const accuracy = (hits / 5) * 100;
         return {
             ...p,
             predictedNumbers: JSON.stringify(top25),
             actualNumbers: typeof p.actualNumbers === 'string' ? p.actualNumbers : JSON.stringify(p.actualNumbers),
             hits,
             accuracy
         };
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
