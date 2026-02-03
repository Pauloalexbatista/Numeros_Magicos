import { prisma } from '@/lib/prisma';
import { rankedSystems, numberBaseSystems, numberEnsembleSystems, IPredictiveSystem } from './ranked-systems';
import { starSystems, starBaseSystems, starEnsembleSystems, StarSystem } from './star-systems';
import { totolotoRankedSystems, totolotoStarSystems } from './totoloto-systems';
import { EuroDreamsSystemWrapper, EuroDreamsStarSystemWrapper } from './eurodreams-systems';
import { Draw } from '@prisma/client';

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
            where: { name: system.name },
            update: { description: system.description, game: 'EUROMILLIONS' },
            create: { name: system.name, description: system.description, isActive: true, game: 'EUROMILLIONS' }
        });
    }
    for (const system of starSystems) {
        await prisma.rankedSystem.upsert({
            where: { name: system.name },
            update: { description: system.description, game: 'EUROMILLIONS', domain: 'STARS' },
            create: { name: system.name, description: system.description, isActive: true, game: 'EUROMILLIONS', domain: 'STARS' }
        });
    }

    // 2. Initialize Totoloto Systems
    for (const system of totolotoRankedSystems) {
        await prisma.rankedSystem.upsert({
            where: { name: system.name },
            update: { description: system.description, game: 'TOTOLOTO' },
            create: { name: system.name, description: system.description, isActive: true, game: 'TOTOLOTO' }
        });
    }
    for (const system of totolotoStarSystems) {
        await prisma.rankedSystem.upsert({
            where: { name: system.name },
            update: { description: system.description, game: 'TOTOLOTO', domain: 'STARS' },
            create: { name: system.name, description: system.description, isActive: true, game: 'TOTOLOTO', domain: 'STARS' }
        });
    }

    // 3. Initialize EuroDreams Systems
    for (const system of euroDreamsRankedSystems) {
        await prisma.rankedSystem.upsert({
            where: { name: system.name },
            update: { description: system.description, game: 'EURODREAMS' },
            create: { name: system.name, description: system.description, isActive: true, game: 'EURODREAMS' }
        });
    }
    for (const system of euroDreamsStarSystems) {
        await prisma.rankedSystem.upsert({
            where: { name: system.name },
            update: { description: system.description, game: 'EURODREAMS', domain: 'STARS' },
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
        systemTypes?: ('BASE' | 'NEURAL' | 'ENSEMBLE')[];
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
    let systemInstances: IPredictiveSystem[] = []; // Changed from IGameService[] to IPredictiveSystem[] to match existing types

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
        if (draw.systemPerformances.some(p => p.systemName === system.name)) continue;

        // Generate prediction
        const predictedNumbers = await system.generateTop10(history);

        // Calculate hits (compare Top 10 vs Actual numbers)
        const hits = actualNumbers.filter(n => predictedNumbers.includes(n)).length;

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
 * Evaluate Star Systems for a specific draw (or filtered by type)
 * @param drawId - The draw to evaluate
 * @param options - Optional filters for selective calculation
 */
export async function evaluateDrawStars(
    drawId: number,
    options?: {
        systemTypes?: ('BASE' | 'NEURAL' | 'ENSEMBLE')[];
        maxComplexity?: 1 | 2 | 3;
    }
) {
    const draw = await prisma.draw.findUnique({
        where: { id: drawId },
        include: { systemPerformances: true }
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
        orderBy: { name: 'asc' } // Temporary: use name until Prisma Client is regenerated
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
        if (draw.systemPerformances.some(p => p.systemName === system.name)) {
            continue;
        }

        try {
            const predictedStars = await system.generatePrediction(history);

            const hits = actualStars.filter(n => predictedStars.includes(n)).length;
            const accuracy = (hits / totalStars) * 100;

            await prisma.starSystemPerformance.create({
                data: {
                    drawId: draw.id,
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
            where: { systemName: system.name },
            orderBy: { draw: { date: 'desc' } }
            // No limit: Calculate accuracy on full history
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
 * Executes in 4 phases to ensure ensemble systems run after base systems
 */
export async function cachePredictions() {
    // Get full history
    const history = await prisma.draw.findMany({
        orderBy: { date: 'desc' }
    });

    console.log(`\n${'='.repeat(80)}`);
    console.log(`🎯 GENERATING CACHED PREDICTIONS (4 PHASES)`);
    console.log(`📊 Based on ${history.length} historical draws`);
    console.log(`${'='.repeat(80)}\n`);

    const allNumbers = Array.from({ length: 50 }, (_, i) => i + 1);

    // ============================================
    // PHASE 1: NUMBER BASE SYSTEMS
    // ============================================
    console.log(`\n${'─'.repeat(80)}`);
    console.log(`📍 PHASE 1/4: Number Base Systems (${numberBaseSystems.length} systems)`);
    console.log(`${'─'.repeat(80)}`);

    for (const [index, system] of numberBaseSystems.entries()) {
        try {
            const sysStart = performance.now();
            process.stdout.write(`[🎯 ${index + 1}/${numberBaseSystems.length}] ${system.name}... `);

            const prediction = await system.generateTop10(history);
            const topPrediction = Array.from(new Set(prediction)).slice(0, 25);
            const worstNumbers = allNumbers.filter(n => !topPrediction.includes(n)).slice(0, 25);

            await prisma.cachedPrediction.upsert({
                where: { systemName: system.name },
                update: {
                    numbers: JSON.stringify(topPrediction),
                    worstNumbers: JSON.stringify(worstNumbers),
                    updatedAt: new Date()
                },
                create: {
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

    // ============================================
    // PHASE 2: NUMBER ENSEMBLE SYSTEMS
    // ============================================
    console.log(`\n${'─'.repeat(80)}`);
    console.log(`📍 PHASE 2/4: Number Ensemble Systems (${numberEnsembleSystems.length} systems)`);
    console.log(`${'─'.repeat(80)}`);

    for (const [index, system] of numberEnsembleSystems.entries()) {
        try {
            const sysStart = performance.now();
            process.stdout.write(`[🔗 ${index + 1}/${numberEnsembleSystems.length}] ${system.name}... `);

            const prediction = await system.generateTop10(history);
            const topPrediction = Array.from(new Set(prediction)).slice(0, 25);
            const worstNumbers = allNumbers.filter(n => !topPrediction.includes(n)).slice(0, 25);

            await prisma.cachedPrediction.upsert({
                where: { systemName: system.name },
                update: {
                    numbers: JSON.stringify(topPrediction),
                    worstNumbers: JSON.stringify(worstNumbers),
                    updatedAt: new Date()
                },
                create: {
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

    // ============================================
    // PHASE 3: STAR BASE SYSTEMS
    // ============================================
    console.log(`\n${'─'.repeat(80)}`);
    console.log(`📍 PHASE 3/4: Star Base Systems (${starBaseSystems.length} systems)`);
    console.log(`${'─'.repeat(80)}`);

    const allStars = Array.from({ length: 12 }, (_, i) => i + 1);

    for (const [index, system] of starBaseSystems.entries()) {
        try {
            const sysStart = performance.now();
            process.stdout.write(`[⭐ ${index + 1}/${starBaseSystems.length}] ${system.name}... `);

            const prediction = await system.generatePrediction(history);
            const topStars = Array.from(new Set(prediction));
            const worstStars = allStars.filter(n => !topStars.includes(n));

            await prisma.cachedPrediction.upsert({
                where: { systemName: system.name },
                update: {
                    numbers: JSON.stringify(topStars),
                    worstNumbers: JSON.stringify(worstStars),
                    updatedAt: new Date()
                },
                create: {
                    systemName: system.name,
                    numbers: JSON.stringify(topStars),
                    worstNumbers: JSON.stringify(worstStars)
                }
            });

            const sysEnd = performance.now();
            console.log(`✅ ${(sysEnd - sysStart).toFixed(0)}ms`);
        } catch (error) {
            console.error(`❌ Failed:`, error);
        }
    }

    // ============================================
    // PHASE 4: STAR ENSEMBLE SYSTEMS
    // ============================================
    console.log(`\n${'─'.repeat(80)}`);
    console.log(`📍 PHASE 4/4: Star Ensemble Systems (${starEnsembleSystems.length} systems)`);
    console.log(`${'─'.repeat(80)}`);

    for (const [index, system] of starEnsembleSystems.entries()) {
        try {
            const sysStart = performance.now();
            process.stdout.write(`[🌟 ${index + 1}/${starEnsembleSystems.length}] ${system.name}... `);

            const prediction = await system.generatePrediction(history);
            const topStars = Array.from(new Set(prediction));
            const worstStars = allStars.filter(n => !topStars.includes(n));

            await prisma.cachedPrediction.upsert({
                where: { systemName: system.name },
                update: {
                    numbers: JSON.stringify(topStars),
                    worstNumbers: JSON.stringify(worstStars),
                    updatedAt: new Date()
                },
                create: {
                    systemName: system.name,
                    numbers: JSON.stringify(topStars),
                    worstNumbers: JSON.stringify(worstStars)
                }
            });

            const sysEnd = performance.now();
            console.log(`✅ ${(sysEnd - sysStart).toFixed(0)}ms`);
        } catch (error) {
            console.error(`❌ Failed:`, error);
        }
    }

    console.log(`\n${'='.repeat(80)}`);
    console.log(`✅ ALL PHASES COMPLETE`);
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

    // Get history BEFORE this draw
    const history = await prisma.draw.findMany({
        where: {
            game: draw.game,
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
