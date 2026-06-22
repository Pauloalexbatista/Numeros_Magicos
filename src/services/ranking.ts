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
            where: { name_game: { name: system.name, game: 'EUROMILLIONS' } },
            update: { description: system.description, systemType: system.type || 'base' },
            create: { name: system.name, description: system.description, isActive: true, game: 'EUROMILLIONS', systemType: system.type || 'base' }
        });
    }
    for (const system of starSystems) {
        await prisma.rankedSystem.upsert({
            where: { name_game: { name: system.name, game: 'EUROMILLIONS' } },
            update: { description: system.description, domain: 'STARS', systemType: system.type || 'base' },
            create: { name: system.name, description: system.description, isActive: true, game: 'EUROMILLIONS', domain: 'STARS', systemType: system.type || 'base' }
        });
    }

    // 2. Initialize Totoloto Systems
    for (const system of totolotoRankedSystems) {
        await prisma.rankedSystem.upsert({
            where: { name_game: { name: system.name, game: 'TOTOLOTO' } },
            update: { description: system.description, systemType: system.type || 'base' },
            create: { name: system.name, description: system.description, isActive: true, game: 'TOTOLOTO', systemType: system.type || 'base' }
        });
    }
    for (const system of totolotoStarSystems) {
        await prisma.rankedSystem.upsert({
            where: { name_game: { name: system.name, game: 'TOTOLOTO' } },
            update: { description: system.description, domain: 'STARS', systemType: system.type || 'base' },
            create: { name: system.name, description: system.description, isActive: true, game: 'TOTOLOTO', domain: 'STARS', systemType: system.type || 'base' }
        });
    }

    // 3. Initialize EuroDreams Systems
    for (const system of euroDreamsRankedSystems) {
        await prisma.rankedSystem.upsert({
            where: { name_game: { name: system.name, game: 'EURODREAMS' } },
            update: { description: system.description, systemType: system.type || 'base' },
            create: { name: system.name, description: system.description, isActive: true, game: 'EURODREAMS', systemType: system.type || 'base' }
        });
    }
    for (const system of euroDreamsStarSystems) {
        await prisma.rankedSystem.upsert({
            where: { name_game: { name: system.name, game: 'EURODREAMS' } },
            update: { description: system.description, domain: 'STARS', systemType: system.type || 'base' },
            create: { name: system.name, description: system.description, isActive: true, game: 'EURODREAMS', domain: 'STARS', systemType: system.type || 'base' }
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

    // Get ALL systems from database (ignore isActive for background evaluation)
    const whereClause: any = {
        game: draw.game,
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
        orderBy: { priority: 'asc' }
    });

    console.log(`  Found ${dbSystems.length} systems in database`);

    // Fetch all training statuses at once for neural checks
    const trainingStatuses = await prisma.mLModelTraining.findMany();

    // Mapping function to check if a neural system is trained
    const isNeuralTrained = (name: string, game: string): boolean => {
        let type = '';
        const nName = name.toUpperCase();
        const nGame = game.toUpperCase();

        if (nName.includes('LSTM')) {
            type = `LSTM_${nGame}_NUMBERS`;
        } else if (nName.includes('RANDOM FOREST')) {
            type = `RF_${nGame}_NUMBERS`;
        } else if (nName.includes('ML CLASSIFIER') || nName.includes('TITAN')) {
            type = `CLASSIFIER_${nGame}_NUMBERS`;
        }

        if (!type) return true; // Not a known neural system, or has separate check
        return trainingStatuses.some(t => t.modelType === type);
    };

    // Map to actual system instances
    let allInstances: IPredictiveSystem[] = [];
    if (draw.game === 'TOTOLOTO') allInstances = totolotoRankedSystems;
    else if (draw.game === 'EURODREAMS') allInstances = euroDreamsRankedSystems;
    else allInstances = rankedSystems;

    // Filter by what was found in DB AND neural readiness
    const systemInstances = allInstances.filter(s => {
        const dbMatch = dbSystems.find(db => db.name === s.name);
        if (!dbMatch) return false;
        if (dbMatch.systemType === 'NEURAL') return isNeuralTrained(s.name, draw.game);
        return true;
    });

    // Get history BEFORE this draw
    const history = await prisma.draw.findMany({
        where: {
            game: draw.game,
            date: { lt: draw.date }
        },
        orderBy: { date: 'desc' }
    });

    const actualNumbers = (typeof draw.numbers === "string" ? (typeof draw.numbers === "string" ? JSON.parse(draw.numbers) : draw.numbers) : draw.numbers as unknown) as number[];

    for (const system of systemInstances) {
        // Check if we already have performance for this system/draw
        // Normalize names to handle potential encoding differences
        const normalizedSystemName = system.name.trim().normalize('NFC');
        if (draw.systemPerformances.some(p =>
            p.systemName.trim().normalize('NFC') === normalizedSystemName &&
            p.game === draw.game
        )) continue;

        // Generate prediction (full pool for FullPool table, sliced for legacy table)
        const fullPool = await system.generateTop10(history, true);
        const predictedNumbers = fullPool; // Keep alias for legacy compat

        // Calculate hits (compare standard slice vs Actual numbers)
        const defaultPredCount = (draw.game === 'EURODREAMS') ? 20 : (draw.game === 'MEGASENA' ? 30 : 25);
        const slicedPredictions = fullPool.slice(0, defaultPredCount);
        const hits = actualNumbers.filter(n => slicedPredictions.includes(n)).length;

        // Dynamic accuracy base: EuroDreams has 6 numbers, others 5
        const numbersToDraw = (draw.game === 'EURODREAMS' || draw.game === 'MEGASENA') ? 6 : 5;
        const accuracy = (hits / numbersToDraw) * 100;

        // Save performance to legacy table (still used for star evaluations and some paths)
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

        // Also save to SystemPerformanceFullPool (the new canonical table used by the UI)
        const existingFullPool = await prisma.systemPerformanceFullPool.findFirst({
            where: { drawId: draw.id, systemName: system.name, game: draw.game }
        });
        if (!existingFullPool) {
            await prisma.systemPerformanceFullPool.create({
                data: {
                    drawId: draw.id,
                    game: draw.game,
                    systemName: system.name,
                    predictedNumbers: JSON.stringify(fullPool),
                    actualNumbers: draw.numbers
                }
            });
        }
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

    // Get star systems from database (all of them)
    const whereClause: any = {
        game: draw.game,
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

    const trainingStatuses = await prisma.mLModelTraining.findMany();

    const isNeuralStarTrained = (name: string, game: string): boolean => {
        let type = '';
        const nName = name.toUpperCase();
        const nGame = game.toUpperCase();

        if (nName.includes('LSTM')) {
            const dbDomain = nGame === 'EURODREAMS' ? 'DREAMS' : 'STARS';
            type = `LSTM_${nGame}_${dbDomain}`;
        } else if (nName.includes('RANDOM FOREST')) {
            type = `RF_${nGame}_STARS`;
        } else if (nName.includes('ML CLASSIFIER') || nName.includes('TITAN')) {
            type = `CLASSIFIER_${nGame}_STARS`;
        }

        if (!type) return true;
        return trainingStatuses.some(t => t.modelType === type);
    };

    let allInstances: StarSystem[] = [];
    if (draw.game === 'TOTOLOTO') allInstances = totolotoStarSystems;
    else if (draw.game === 'EURODREAMS') allInstances = euroDreamsStarSystems;
    else allInstances = starSystems;

    const systemInstances = allInstances.filter(s => {
        const dbMatch = dbSystems.find(db => db.name === s.name);
        if (!dbMatch) return false;
        if (dbMatch.systemType === 'NEURAL') return isNeuralStarTrained(s.name, draw.game);
        return true;
    });

    console.log(`  [Stars] Matched ${systemInstances.length} system instances`);

    // Get history BEFORE this draw
    const history = await prisma.draw.findMany({
        where: {
            game: draw.game,
            date: { lt: draw.date }
        },
        orderBy: { date: 'desc' }
    });

    const actualStars = (typeof draw.stars === "string" ? (typeof draw.stars === "string" ? JSON.parse(draw.stars) : draw.stars) : draw.stars as unknown) as number[];

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
    const systems = await prisma.rankedSystem.findMany();

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
        where: { domain: 'STARS' }
    });

    for (const system of systems) {
        // Get all performances
        const performances = await prisma.starSystemPerformance.findMany({
            where: { systemName: system.name, game: system.game },
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
/**
 * Generate and cache predictions for the NEXT draw for all ACTIVE systems
 */
export async function cachePredictions() {
    await initializeSystems();
    
    // Get ACTIVE systems from DB to only cache what is currently in use/visible
    const activeSystemsInDb = await prisma.rankedSystem.findMany({
        where: { isActive: true }
    });

    // Get full history
    const history = await prisma.draw.findMany({
        orderBy: { date: 'desc' }
    });

    console.log(`\n${'='.repeat(80)}`);
    console.log(`🎯 GENERATING CACHED PREDICTIONS`);
    console.log(`📊 Based on ${history.length} historical draws`);
    console.log(`${'='.repeat(80)}\n`);

    // Helper for game-specific pools
    const getPool = (game: string) => Array.from({ length: game === 'TOTOLOTO' ? 49 : game === 'EURODREAMS' ? 40 : game === 'MEGASENA' ? 60 : 50 }, (_, i) => i + 1);
    const getStarPool = (game: string) => Array.from({ length: game === 'TOTOLOTO' ? 13 : game === 'EURODREAMS' ? 5 : 12 }, (_, i) => i + 1);

    // List of system groups by game
    const gameGroups = [
        { name: 'EUROMILLIONS (Numbers)', systems: [...numberBaseSystems, ...numberEnsembleSystems], game: 'EUROMILLIONS', isStars: false },
        { name: 'EUROMILLIONS (Stars)', systems: [...starBaseSystems, ...starEnsembleSystems], game: 'EUROMILLIONS', isStars: true },
        { name: 'TOTOLOTO (Numbers)', systems: totolotoRankedSystems, game: 'TOTOLOTO', isStars: false },
        { name: 'TOTOLOTO (Stars)', systems: totolotoStarSystems, game: 'TOTOLOTO', isStars: true },
        { name: 'EURODREAMS (Numbers)', systems: euroDreamsRankedSystems, game: 'EURODREAMS', isStars: false },
        { name: 'EURODREAMS (Stars)', systems: euroDreamsStarSystems, game: 'EURODREAMS', isStars: true },
        { name: 'MEGASENA (Numbers)', systems: rankedSystems, game: 'MEGASENA', isStars: false }
    ];

    for (const group of gameGroups) {
        console.log(`\n${'─'.repeat(80)}`);
        console.log(`📍 PROCESSING: ${group.name} (${group.systems.length} systems)`);
        console.log(`${'─'.repeat(80)}`);

        const gameHistory = history.filter(d => d.game === group.game);
        const pool = group.isStars ? getStarPool(group.game) : getPool(group.game);
        
        let predCount = 25;
        if (group.isStars) {
            const { getPredictionCount } = require('./star-systems');
            predCount = getPredictionCount(gameHistory);
        } else {
            const { predCount: pCount } = getGameConfig(gameHistory);
            predCount = pCount;
        }

        for (const [index, system] of group.systems.entries()) {
            // SKIP IF NOT ACTIVE OR NOT TRAINED
            const dbRef = activeSystemsInDb.find(db => db.name === system.name && db.game === group.game);
            if (!dbRef) continue;

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

    const actualNumbers = (typeof draw.numbers === "string" ? (typeof draw.numbers === "string" ? JSON.parse(draw.numbers) : draw.numbers) : draw.numbers as unknown) as number[];

    for (const system of rankedSystems.filter(s => s.name.includes(draw.game) || !s.name.includes('_'))) {
        const existingPerf = draw.stagingPerformances.find(p => p.systemName === system.name && (p as any).game === draw.game);
        if (existingPerf) continue;

        const predictedNumbers = await system.generateTop10(history);
        const defaultPredCount = (draw.game === 'EURODREAMS') ? 20 : (draw.game === 'MEGASENA' ? 30 : 25);
        const slicedPredictions = predictedNumbers.slice(0, defaultPredCount);
        const hits = actualNumbers.filter(n => slicedPredictions.includes(n)).length;
        const numbersToDraw = (draw.game === 'EURODREAMS' || draw.game === 'MEGASENA') ? 6 : 5;
        const accuracy = (hits / numbersToDraw) * 100;

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
