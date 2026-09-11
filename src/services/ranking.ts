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

import { evaluateDraw, evaluateDrawStars } from './evaluationService';
import { processInBatches } from '@/utils/batch-processor';

export { evaluateDraw, evaluateDrawStars };

/**
 * Update the global ranking table based on recent performance
 */
export async function updateRanking() {
    const systems = await prisma.rankedSystem.findMany();

    for (const system of systems) {
        const performances = await prisma.systemPrediction.findMany({
            where: { systemName: system.name, game: system.game, domain: 'NUMBERS' },
            orderBy: { draw: { date: 'desc' } },
            take: 100
        });

        if (performances.length === 0) continue;

        const maxHits = system.game === 'TOTOLOTO' || system.game === 'EURODREAMS' || system.game === 'MEGASENA' ? 6 : 5;
        const totalAccuracy = performances.reduce((sum, p) => sum + (((p.num_hits_25 ?? p.num_hits_20 ?? 0) / maxHits) * 100), 0);
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
        const performances = await prisma.systemPrediction.findMany({
            where: { systemName: system.name, game: system.game, domain: 'STARS' },
            include: { draw: true }
        });

        if (performances.length === 0) continue;

        const total = performances.length;
        const totalHits = performances.reduce((sum, p) => sum + ((system.game === 'EUROMILLIONS') ? (p.star_hits_4 ?? p.star_hits_2 ?? 0) : (p.star_hits_2 ?? 0)), 0);

        const jackpots = performances.filter(p => {
            const hits = (system.game === 'EUROMILLIONS') ? (p.star_hits_4 ?? p.star_hits_2 ?? 0) : (p.star_hits_2 ?? 0);
            return hits >= (system.game === 'EUROMILLIONS' ? 2 : 1);
        }).length;

        const accuracy = performances.reduce((accSum, p) => {
            const maxStars = system.game === 'EUROMILLIONS' ? 2 : 1;
            const hits = (system.game === 'EUROMILLIONS') ? (p.star_hits_4 ?? p.star_hits_2 ?? 0) : (p.star_hits_2 ?? 0);
            return accSum + (hits / maxStars);
        }, 0);

        const avgAccuracy = (accuracy / total) * 100;

        await prisma.starSystemRanking.upsert({
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
export async function backfillRankings(limit: number = 50, exclusive?: 'stars' | 'numbers') {
    await initializeSystems();

    const draws = await prisma.draw.findMany({
        orderBy: { date: 'desc' },
        take: limit
    });

    const sortedDraws = draws.reverse();
    console.log(`Starting backfill for ${sortedDraws.length} draws${exclusive ? ` (Exclusive: ${exclusive})` : ''}...`);

    await processInBatches(
        sortedDraws,
        10,
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
 * Generate and cache predictions for the NEXT draw for all ACTIVE systems
 */
export async function cachePredictions() {
    await initializeSystems();
    
    const activeSystemsInDb = await prisma.rankedSystem.findMany({
        where: { isActive: true }
    });

    const history = await prisma.draw.findMany({
        orderBy: { date: 'desc' }
    });

    console.log(`\n${'='.repeat(80)}`);
    console.log(`🎯 GENERATING CACHED PREDICTIONS`);
    console.log(`📊 Based on ${history.length} historical draws`);
    console.log(`${'='.repeat(80)}\n`);

    const getPool = (game: string) => Array.from({ length: game === 'TOTOLOTO' ? 49 : game === 'EURODREAMS' ? 40 : game === 'MEGASENA' ? 60 : 50 }, (_, i) => i + 1);
    const getStarPool = (game: string) => Array.from({ length: game === 'TOTOLOTO' ? 13 : game === 'EURODREAMS' ? 5 : 12 }, (_, i) => i + 1);

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
            const dbRef = activeSystemsInDb.find(db => db.name === system.name && db.game === group.game);
            if (!dbRef) continue;

            try {
                const sysStart = performance.now();
                process.stdout.write(`[🎯 ${index + 1}/${group.systems.length}] ${system.name}... `);

                const prediction = group.isStars
                    ? await (system as any).generatePrediction(gameHistory)
                    : await (system as any).generateTop10(gameHistory, true);

                const topPrediction = group.isStars
                    ? Array.from(new Set(prediction)).slice(0, predCount)
                    : prediction.slice(0, predCount);
                const worstNumbers = group.isStars
                    ? pool.filter(n => !topPrediction.includes(n)).slice(0, predCount)
                    : prediction.slice(predCount);

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

    const actualNumbers = (typeof draw.numbers === "string" ? JSON.parse(draw.numbers) : draw.numbers) as number[];

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
