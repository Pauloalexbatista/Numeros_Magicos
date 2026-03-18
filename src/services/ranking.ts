import { prisma } from '@/lib/prisma';
import { rankedSystems, numberBaseSystems, numberEnsembleSystems, IPredictiveSystem } from './ranked-systems';
import { starSystems, starBaseSystems, starEnsembleSystems, StarSystem } from './star-systems';
import { totolotoRankedSystems, totolotoStarSystems } from './totoloto-systems';
import { EuroDreamsSystemWrapper, EuroDreamsStarSystemWrapper } from './eurodreams-systems';
import { getGameConfig } from './game-config';

// Re-export for scripts
export {
    totolotoRankedSystems,
    totolotoStarSystems,
    rankedSystems,
    starSystems
};

// Create EuroDreams System Instances
export const euroDreamsRankedSystems: IPredictiveSystem[] = rankedSystems.map(sys => new EuroDreamsSystemWrapper(sys));
export const euroDreamsStarSystems: StarSystem[] = starSystems.map(sys => new EuroDreamsStarSystemWrapper(sys));

/**
 * Initialize all systems in the database
 */
// --- System Initialization ---
export async function initializeSystems() {
    // 1. Initialize EuroMillions Systems
    for (const system of rankedSystems) {
        await prisma.rankedSystem.upsert({
            where: {
                name_game: {
                    name: system.name,
                    game: 'EUROMILLIONS'
                }
            },
            update: { description: system.description },
            create: { name: system.name, description: system.description, isActive: true, game: 'EUROMILLIONS' }
        });
    }
    for (const system of starSystems) {
        await prisma.rankedSystem.upsert({
            where: {
                name_game: {
                    name: system.name,
                    game: 'EUROMILLIONS'
                }
            },
            update: { description: system.description, domain: 'STARS' },
            create: { name: system.name, description: system.description, isActive: true, game: 'EUROMILLIONS', domain: 'STARS' }
        });
    }

    // 2. Initialize Totoloto Systems
    for (const system of totolotoRankedSystems) {
        await prisma.rankedSystem.upsert({
            where: {
                name_game: {
                    name: system.name,
                    game: 'TOTOLOTO'
                }
            },
            update: { description: system.description },
            create: { name: system.name, description: system.description, isActive: true, game: 'TOTOLOTO' }
        });
    }
    for (const system of totolotoStarSystems) {
        await prisma.rankedSystem.upsert({
            where: {
                name_game: {
                    name: system.name,
                    game: 'TOTOLOTO'
                }
            },
            update: { description: system.description, domain: 'STARS' },
            create: { name: system.name, description: system.description, isActive: true, game: 'TOTOLOTO', domain: 'STARS' }
        });
    }

    // 3. Initialize EuroDreams Systems
    for (const system of euroDreamsRankedSystems) {
        await prisma.rankedSystem.upsert({
            where: {
                name_game: {
                    name: system.name,
                    game: 'EURODREAMS'
                }
            },
            update: { description: system.description },
            create: { name: system.name, description: system.description, isActive: true, game: 'EURODREAMS' }
        });
    }
    for (const system of euroDreamsStarSystems) {
        await prisma.rankedSystem.upsert({
            where: {
                name_game: {
                    name: system.name,
                    game: 'EURODREAMS'
                }
            },
            update: { description: system.description, domain: 'STARS' },
            create: { name: system.name, description: system.description, isActive: true, game: 'EURODREAMS', domain: 'STARS' }
        });
    }

    console.log('✅ All Systems Initialized (EUROMILLIONS, TOTOLOTO, EURODREAMS)');
}

/**
 * Evaluate a draw against all active systems (or filtered by type)
 * @param drawId - The draw to evaluate
 * @param options - Optional filters for selective calculation
 */
export async function evaluateDraw(
    drawId: number,
    options?: {
        systemTypes?: ('BASE' | 'NEURAL')[];
        maxComplexity?: 1 | 2 | 3;
        domain?: 'NUMBERS' | 'STARS';
    }
) {
    const draw = await prisma.draw.findUnique({
        where: { id: drawId },
        include: { systemPerformances: true }
    });

    if (!draw) {
        throw new Error(`Draw ${drawId} not found`);
    }

    console.log(`Evaluating draw ${drawId} (${draw.date.toISOString().split('T')[0]})...`);

    // Get systems from database with filters
    const whereClause: any = {
        game: draw.game,
        isActive: true,
        domain: options?.domain || 'NUMBERS'
    };

    if (options?.systemTypes) {
        whereClause.systemType = { in: options.systemTypes };
    }

    if (options?.maxComplexity) {
        whereClause.complexity = { lte: options.maxComplexity };
    }

    const dbSystems = await prisma.rankedSystem.findMany({
        where: whereClause,
        orderBy: { priority: 'asc' } // Calculate by priority order
    });

    console.log(`  Found ${dbSystems.length} systems to evaluate`);

    // Map to actual system instances
    let systemInstances: IPredictiveSystem[] = [];

    if (draw.game === 'TOTOLOTO') {
        systemInstances = totolotoRankedSystems.filter(s =>
            dbSystems.some(db => db.name === s.name)
        );
    } else if (draw.game === 'EURODREAMS') {
        systemInstances = euroDreamsRankedSystems.filter(s =>
            dbSystems.some(db => db.name === s.name)
        );
    } else {
        systemInstances = rankedSystems.filter(s =>
            dbSystems.some(db => db.name === s.name)
        );
    }

    // Get history BEFORE this draw
    const history = await prisma.draw.findMany({
        where: {
            game: draw.game,
            date: { lt: draw.date }
        },
        orderBy: { date: 'desc' }
    });

    const actualNumbers = JSON.parse(draw.numbers) as number[];

    for (const system of systemInstances) {
        // Check if we already have performance for this system/draw
        // Normalize names to handle potential encoding differences
        const normalizedSystemName = system.name.trim().normalize('NFC');
        if (draw.systemPerformances.some(p =>
            p.systemName.trim().normalize('NFC') === normalizedSystemName &&
            p.game === draw.game
        )) continue;

        // Generate prediction
        const predictedNumbers = await system.generateTop10(history);

        // Calculate hits (compare Top 10 vs Actual numbers)
        const hits = actualNumbers.filter(n => predictedNumbers.includes(n)).length;

        // Dynamic accuracy base: EuroDreams has 6 numbers, others 5
        const numbersToDraw = draw.game === 'EURODREAMS' ? 6 : 5;
        const accuracy = (hits / numbersToDraw) * 100;

        // Save performance
        await prisma.systemPerformance.create({
            data: {
                drawId: draw.id,
                game: draw.game,
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
 * Evaluate Star Systems for a specific draw (or filtered by type)
 * @param drawId - The draw to evaluate
 * @param options - Optional filters for selective calculation
 */
export async function evaluateDrawStars(
    drawId: number,
    options?: {
        systemTypes?: ('BASE' | 'NEURAL')[];
        maxComplexity?: 1 | 2 | 3;
    }
) {
    const draw = await prisma.draw.findUnique({
        where: { id: drawId },
        include: { starPerformances: true }
    });

    if (!draw) {
        throw new Error(`Draw ${drawId} not found`);
    }

    // Get star systems from database with filters
    const whereClause: any = {
        game: draw.game,
        isActive: true,
        domain: 'STARS'
    };

    if (options?.systemTypes) {
        whereClause.systemType = { in: options.systemTypes };
    }

    if (options?.maxComplexity) {
        whereClause.complexity = { lte: options.maxComplexity };
    }

    const dbSystems = await prisma.rankedSystem.findMany({
        where: whereClause,
        orderBy: { name: 'asc' }
    });

    // Map to actual system instances
    console.log(`  [Stars] Found ${dbSystems.length} systems in DB for ${draw.game}`);
    let systemInstances: StarSystem[] = [];

    if (draw.game === 'TOTOLOTO') {
        systemInstances = totolotoStarSystems.filter(s =>
            dbSystems.some(db => db.name === s.name)
        );
    } else if (draw.game === 'EURODREAMS') {
        systemInstances = euroDreamsStarSystems.filter(s =>
            dbSystems.some(db => db.name === s.name)
        );
    } else {
        systemInstances = starSystems.filter(s =>
            dbSystems.some(db => db.name === s.name)
        );
    }

    console.log(`  [Stars] Matched ${systemInstances.length} system instances`);

    // Get history BEFORE this draw
    const history = await prisma.draw.findMany({
        where: {
            game: draw.game,
            date: { lt: draw.date }
        },
        orderBy: { date: 'desc' }
    });

    const actualStars = JSON.parse(draw.stars) as number[];

    // Dynamic star count: EuroMillions=2, Totoloto/EuroDreams=1
    const totalStars = (draw.game === 'TOTOLOTO' || draw.game === 'EURODREAMS') ? 1 : 2;

    for (const system of systemInstances) {
        // Check if we already have performance for this system/draw
        const normalizedSystemName = system.name.trim().normalize('NFC');
        if (draw.starPerformances.some(p =>
            p.systemName.trim().normalize('NFC') === normalizedSystemName &&
            p.game === draw.game
        )) {
            continue;
        }

        try {
            const predictedStars = await system.generatePrediction(history);

            const hits = actualStars.filter(n => predictedStars.includes(n)).length;
            const accuracy = (hits / totalStars) * 100;

            await prisma.starSystemPerformance.create({
                data: {
                    drawId: draw.id,
                    game: draw.game,
                    systemName: system.name,
                    predictedStars: JSON.stringify(predictedStars),
                    actualStars: draw.stars,
                    hits
                }
            });
        } catch (err) {
            console.error(`Failed to evaluate Star System ${system.name}:`, err);
        }
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
            where: { systemName: system.name, game: system.game },
            orderBy: { draw: { date: 'desc' } }
        });

        if (performances.length === 0) continue;

        const totalAccuracy = performances.reduce((sum, p) => sum + p.accuracy, 0);
        const avgAccuracy = totalAccuracy / performances.length;

        await prisma.systemRanking.upsert({
            where: {
                systemName_game: {
                    systemName: system.name,
                    game: system.game
                }
            },
            update: {
                avgAccuracy,
                totalPredictions: performances.length,
                lastUpdated: new Date()
            },
            create: {
                game: system.game,
                systemName: system.name,
                avgAccuracy,
                totalPredictions: performances.length
            }
        });
    }

    // NEW: Also trigger Star Rankings update
    await updateStarRankings();
}

/**
 * Update the star ranking table based on full history
 */
export async function updateStarRankings() {
    console.log('⭐ Updating Star System Rankings...');

    const systems = await prisma.rankedSystem.findMany({
        where: { domain: 'STARS', isActive: true }
    });

    for (const system of systems) {
        // Get all performances
        const performances = await prisma.starSystemPerformance.findMany({
            where: { systemName: system.name },
            include: { draw: true }
        });

        if (performances.length === 0) continue;

        const total = performances.length;
        const totalHits = performances.reduce((sum, p) => sum + p.hits, 0);

        // Accurate jackpot count based on game rules
        const jackpots = performances.filter(p => p.hits === (p.draw.game === 'EUROMILLIONS' ? 2 : 1)).length;

        // Accuracy: (Total Hits / (Total Draws * MaxStars)) * 100
        const accuracy = performances.reduce((accSum, p) => {
            const maxStars = p.draw.game === 'EUROMILLIONS' ? 2 : 1;
            return accSum + (p.hits / maxStars);
        }, 0);

        const avgAccuracy = (accuracy / total) * 100;

        await (prisma as any).starSystemRanking.upsert({
            where: {
                systemName_game: {
                    systemName: system.name,
                    game: system.game
                }
            },
            update: {
                avgAccuracy,
                totalPredictions: total,
                totalHits: totalHits,
                jackpots,
                lastUpdated: new Date()
            },
            create: {
                game: system.game,
                systemName: system.name,
                avgAccuracy,
                totalPredictions: total,
                totalHits: totalHits,
                jackpots
            }
        });
    }
    console.log('✅ Star Rankings Updated.');
}

/**
 * Run a full backfill for the last N draws
 */
import { processInBatches } from '@/utils/batch-processor';

/**
 * Run a full backfill for the last N draws
 */
export async function backfillRankings(limit: number = 50, exclusive?: 'stars' | 'numbers') {
    await initializeSystems();

    // Get last N draws
    const draws = await prisma.draw.findMany({
        orderBy: { date: 'desc' },
        take: limit
    });

    // Process from oldest to newest within the limit
    const sortedDraws = draws.reverse();

    console.log(`Starting backfill for ${sortedDraws.length} draws${exclusive ? ` (Exclusive: ${exclusive})` : ''}...`);

    // Use batch processing
    await processInBatches(
        sortedDraws,
        10, // Increased batch size for speed
        async (draw) => {
            if (!exclusive || exclusive === 'numbers') {
                await evaluateDraw(draw.id);
            }
            if (!exclusive || exclusive === 'stars') {
                await evaluateDrawStars(draw.id);
            }
        },
        (processed, total) => {
            if (processed % 50 === 0) {
                console.log(`Progress: ${processed}/${total} draws processed`);
            }
        },
        50
    );

    if (!exclusive || exclusive === 'numbers') {
        console.log('Updating main rankings...');
        await updateRanking();
    }

    if (!exclusive || exclusive === 'stars') {
        console.log('Updating star rankings...');
        await updateStarRankings();
    }

    console.log('Caching future predictions...');
    await cachePredictions();

    console.log('Backfill complete.');
}

/**
 * Generate and cache predictions for the NEXT draw for all active systems
 */
export async function cachePredictions() {
    // Get full history
    const history = await prisma.draw.findMany({
        orderBy: { date: 'desc' }
    });

    console.log(`\n${'='.repeat(80)}`);
    console.log(`🎯 GENERATING CACHED PREDICTIONS`);
    console.log(`📊 Based on ${history.length} historical draws`);
    console.log(`${'='.repeat(80)}\n`);

    // Helper for game-specific pools
    const getPool = (game: string) => Array.from({ length: game === 'TOTOLOTO' ? 49 : game === 'EURODREAMS' ? 40 : 50 }, (_, i) => i + 1);
    const getStarPool = (game: string) => Array.from({ length: game === 'TOTOLOTO' ? 13 : game === 'EURODREAMS' ? 5 : 12 }, (_, i) => i + 1);

    // List of system groups by game
    const gameGroups = [
        { name: 'EUROMILLIONS (Numbers)', systems: [...numberBaseSystems, ...numberEnsembleSystems], game: 'EUROMILLIONS', isStars: false },
        { name: 'EUROMILLIONS (Stars)', systems: [...starBaseSystems, ...starEnsembleSystems], game: 'EUROMILLIONS', isStars: true },
        { name: 'TOTOLOTO (Numbers)', systems: totolotoRankedSystems, game: 'TOTOLOTO', isStars: false },
        { name: 'TOTOLOTO (Stars)', systems: totolotoStarSystems, game: 'TOTOLOTO', isStars: true },
        { name: 'EURODREAMS (Numbers)', systems: euroDreamsRankedSystems, game: 'EURODREAMS', isStars: false },
        { name: 'EURODREAMS (Stars)', systems: euroDreamsStarSystems, game: 'EURODREAMS', isStars: true }
    ];

    for (const group of gameGroups) {
        console.log(`\n${'─'.repeat(80)}`);
        console.log(`📍 PROCESSING: ${group.name} (${group.systems.length} systems)`);
        console.log(`${'─'.repeat(80)}`);

        const gameHistory = history.filter(d => d.game === group.game);
        const pool = group.isStars ? getStarPool(group.game) : getPool(group.game);
        const { predCount } = getGameConfig(gameHistory);

        for (const [index, system] of group.systems.entries()) {
            try {
                const sysStart = performance.now();
                process.stdout.write(`[🎯 ${index + 1}/${group.systems.length}] ${system.name}... `);

                const prediction = group.isStars
                    ? await (system as any).generatePrediction(gameHistory)
                    : await (system as any).generateTop10(gameHistory);

                const topPrediction = Array.from(new Set(prediction)).slice(0, predCount);
                const worstNumbers = pool.filter(n => !topPrediction.includes(n)).slice(0, predCount);

                await prisma.cachedPrediction.upsert({
                    where: {
                        systemName_game: {
                            systemName: system.name,
                            game: group.game
                        }
                    },
                    update: {
                        numbers: JSON.stringify(topPrediction),
                        worstNumbers: JSON.stringify(worstNumbers),
                        updatedAt: new Date()
                    },
                    create: {
                        game: group.game,
                        systemName: system.name,
                        numbers: JSON.stringify(topPrediction),
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

    console.log(`\n${'='.repeat(80)}`);
    console.log(`✅ ALL SYSTEMS CACHED`);
    console.log(`${'='.repeat(80)}\n`);
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

    const history = await prisma.draw.findMany({
        where: { game: draw.game, date: { lt: draw.date } },
        orderBy: { date: 'desc' }
    });

    const actualNumbers = JSON.parse(draw.numbers) as number[];

    for (const system of rankedSystems.filter(s => s.name.includes(draw.game) || !s.name.includes('_'))) {
        const existingPerf = draw.stagingPerformances.find(p => p.systemName === system.name && (p as any).game === draw.game);
        if (existingPerf) continue;

        const predictedNumbers = await system.generateTop10(history);
        const hits = actualNumbers.filter(n => predictedNumbers.includes(n)).length;
        const accuracy = (hits / 5) * 100;

        await prisma.systemPerformanceStaging.create({
            data: {
                drawId: draw.id,
                game: draw.game,
                systemName: system.name,
                predictedNumbers: JSON.stringify(predictedNumbers),
                actualNumbers: draw.numbers,
                hits,
                accuracy
            }
        });
    }
}
