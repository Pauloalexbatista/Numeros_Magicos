import { PrismaClient } from '@prisma/client';
import { MatrizCorteSystem } from '../src/services/custom/MatrizCorteSystem';
import { MatrizCorteStarsSystem } from '../src/services/star-systems';
import { initializeSystems } from '../src/services/ranking';
import { getGameConfig } from '../src/services/game-config';

const prisma = new PrismaClient();

const calculateNumberHits = (prediction: number[], actual: number[]) => {
    const hits: Record<string, number> = {};
    for (const cut of [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60]) {
        const top = prediction.slice(0, cut);
        hits[`num_hits_${cut}`] = top.filter(n => actual.includes(n)).length;
    }
    return hits;
};

const calculateStarHits = (prediction: number[], actual: number[]) => {
    const hits: Record<string, number> = {};
    for (const cut of [2, 4, 6, 8, 10, 12]) {
        const top = prediction.slice(0, cut);
        hits[`star_hits_${cut}`] = top.filter(s => actual.includes(s)).length;
    }
    return hits;
};

async function processNumbersForGame(game: string) {
    const systemName = 'Matriz de Corte';
    console.log(`\n============================================================`);
    console.log(`🚀 PROCESSING NUMBERS: ${game} - ${systemName}`);
    console.log(`============================================================`);

    const sys = new MatrizCorteSystem();
    const draws = await prisma.draw.findMany({
        where: { game },
        orderBy: { date: 'desc' }
    });

    console.log(`Total draws found: ${draws.length}`);
    const takeCount = Math.min(draws.length, 100);
    const { maxNum, predCount } = getGameConfig(draws);
    const maxHits = (game === 'EURODREAMS' || game === 'MEGASENA') ? 6 : 5;
    const predCutKey = `num_hits_${predCount}`;

    const startTime = Date.now();
    let processed = 0;
    let jackpots = 0;

    for (let i = 0; i < takeCount; i++) {
        const currentDraw = draws[i];
        const history = draws.slice(i + 1);

        if (history.length < 15) continue;

        const prediction = await sys.generateTop10(history, true);
        const actual = typeof currentDraw.numbers === 'string'
            ? JSON.parse(currentDraw.numbers)
            : (Array.isArray(currentDraw.numbers) ? currentDraw.numbers : []);
        const hits = calculateNumberHits(prediction, actual);

        if (hits[predCutKey] === maxHits) {
            jackpots++;
        }

        const existing = await prisma.systemPrediction.findFirst({
            where: {
                systemName,
                drawId: currentDraw.id,
                domain: 'NUMBERS'
            }
        });

        const data = {
            prediction: JSON.stringify(prediction),
            cutoff: maxNum,
            ...hits,
            calculatedAt: new Date()
        };

        if (existing) {
            await prisma.systemPrediction.update({
                where: { id: existing.id },
                data
            });
        } else {
            await prisma.systemPrediction.create({
                data: {
                    systemName,
                    drawId: currentDraw.id,
                    game,
                    domain: 'NUMBERS',
                    ...data
                }
            });
        }

        processed++;
        if (processed % 25 === 0 || i === takeCount - 1) {
            console.log(`  Processed ${processed}/${takeCount} draws...`);
        }
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`✅ [${game}] Numbers completed in ${elapsed}s (${processed} draws, ${jackpots} jackpots intact).`);

    // Update SystemRanking
    const performances = await prisma.systemPrediction.findMany({
        where: { systemName, game, domain: 'NUMBERS' },
        orderBy: { draw: { date: 'desc' } },
        take: 100
    });

    if (performances.length > 0) {
        const totalAccuracy = performances.reduce((sum, p) => sum + (((p[predCutKey] ?? p.num_hits_25 ?? 0) / maxHits) * 100), 0);
        const avgAccuracy = totalAccuracy / performances.length;

        await prisma.systemRanking.upsert({
            where: {
                systemName_game: {
                    systemName,
                    game
                }
            },
            update: {
                avgAccuracy,
                totalPredictions: performances.length,
                lastUpdated: new Date()
            },
            create: {
                game,
                systemName,
                avgAccuracy,
                totalPredictions: performances.length
            }
        });
        console.log(`📊 [${game}] Ranking updated: avgAccuracy = ${avgAccuracy.toFixed(2)}% over ${performances.length} draws`);
    }

    // Cache Live Next Draw Prediction
    if (draws.length >= 15) {
        const livePred = await sys.generateTop10(draws, true);
        await prisma.cachedPrediction.upsert({
            where: {
                systemName_game: {
                    systemName,
                    game
                }
            },
            update: {
                numbers: JSON.stringify(livePred),
                updatedAt: new Date()
            },
            create: {
                systemName,
                game,
                numbers: JSON.stringify(livePred)
            }
        });
        console.log(`🔮 [${game}] Live prediction cached: top ${predCount} survivors = [${livePred.slice(0, predCount).join(', ')}]`);
    }
}

async function processStarsForGame(game: string) {
    if (game === 'MEGASENA') return; // Mega-Sena has no stars

    const systemName = 'Matriz de Corte Estrelas';
    console.log(`\n============================================================`);
    console.log(`⭐ PROCESSING STARS: ${game} - ${systemName}`);
    console.log(`============================================================`);

    const sys = new MatrizCorteStarsSystem();
    const draws = await prisma.draw.findMany({
        where: { game },
        orderBy: { date: 'desc' }
    });

    const takeCount = Math.min(draws.length, 100);
    const maxStar = (game === 'EURODREAMS') ? 5 : (game === 'TOTOLOTO') ? 13 : 12;
    const starTarget = (game === 'EUROMILLIONS') ? 2 : 1;
    const starCutKey = (game === 'EUROMILLIONS') ? 'star_hits_6' : 'star_hits_2';

    const startTime = Date.now();
    let processed = 0;

    for (let i = 0; i < takeCount; i++) {
        const currentDraw = draws[i];
        const history = draws.slice(i + 1);

        if (history.length < 15) continue;

        const prediction = sys.generatePrediction(history, true);
        const actual = typeof currentDraw.stars === 'string'
            ? JSON.parse(currentDraw.stars)
            : (Array.isArray(currentDraw.stars) ? currentDraw.stars : []);
        const hits = calculateStarHits(prediction, actual);

        const existing = await prisma.systemPrediction.findFirst({
            where: {
                systemName,
                drawId: currentDraw.id,
                domain: 'STARS'
            }
        });

        const data = {
            prediction: JSON.stringify(prediction),
            cutoff: maxStar,
            ...hits,
            calculatedAt: new Date()
        };

        if (existing) {
            await prisma.systemPrediction.update({
                where: { id: existing.id },
                data
            });
        } else {
            await prisma.systemPrediction.create({
                data: {
                    systemName,
                    drawId: currentDraw.id,
                    game,
                    domain: 'STARS',
                    ...data
                }
            });
        }

        processed++;
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`✅ [${game}] Stars completed in ${elapsed}s (${processed} draws).`);

    // Update SystemRanking for Stars
    const performances = await prisma.systemPrediction.findMany({
        where: { systemName, game, domain: 'STARS' },
        orderBy: { draw: { date: 'desc' } },
        take: 100
    });

    if (performances.length > 0) {
        const totalAccuracy = performances.reduce((sum, p) => sum + (((p[starCutKey] ?? 0) / starTarget) * 100), 0);
        const avgAccuracy = totalAccuracy / performances.length;

        await prisma.systemRanking.upsert({
            where: {
                systemName_game: {
                    systemName,
                    game
                }
            },
            update: {
                avgAccuracy,
                totalPredictions: performances.length,
                lastUpdated: new Date()
            },
            create: {
                game,
                systemName,
                avgAccuracy,
                totalPredictions: performances.length
            }
        });
        console.log(`📊 [${game}] Stars ranking updated: avgAccuracy = ${avgAccuracy.toFixed(2)}%`);
    }

    // Cache Live Next Stars Prediction
    if (draws.length >= 15) {
        const livePred = sys.generatePrediction(draws, true);
        await prisma.cachedPrediction.upsert({
            where: {
                systemName_game: {
                    systemName,
                    game
                }
            },
            update: {
                numbers: JSON.stringify(livePred),
                updatedAt: new Date()
            },
            create: {
                systemName,
                game,
                numbers: JSON.stringify(livePred)
            }
        });
        console.log(`🔮 [${game}] Live stars cached: [${livePred.join(', ')}]`);
    }
}

async function main() {
    console.log('⚡ Initializing Systems across all 4 games...');
    await initializeSystems();

    const games = ['EUROMILLIONS', 'TOTOLOTO', 'EURODREAMS', 'MEGASENA'];

    for (const g of games) {
        await processNumbersForGame(g);
        await processStarsForGame(g);
    }

    console.log('\n🎉 ALL 4 GAMES RECALCULATED AND RANKED FOR MATRIZ DE CORTE!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
