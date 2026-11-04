import { PrismaClient } from '@prisma/client';
import { MatrizCorteSystem } from '../src/services/custom/MatrizCorteSystem';
import { MatrizCorteStarsSystem } from '../src/services/star-systems';

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

const GAME_CONFIGS: Record<string, { maxNum: number, predCut: number, maxHits: number, maxStar: number }> = {
    EUROMILLIONS: { maxNum: 50, predCut: 25, maxHits: 5, maxStar: 12 },
    TOTOLOTO: { maxNum: 49, predCut: 25, maxHits: 5, maxStar: 13 },
    EURODREAMS: { maxNum: 40, predCut: 20, maxHits: 6, maxStar: 5 },
    MEGASENA: { maxNum: 60, predCut: 30, maxHits: 6, maxStar: 0 }
};

async function backfillLocalSQLite() {
    const games = ['EURODREAMS', 'TOTOLOTO', 'EUROMILLIONS', 'MEGASENA'];
    const numSys = new MatrizCorteSystem();
    const starSys = new MatrizCorteStarsSystem();

    for (const game of games) {
        console.log(`\n======================================================`);
        console.log(`🚀 PROCESSING LOCAL SQLITE: ${game} - Matriz de Corte`);
        console.log(`======================================================`);

        const draws = await prisma.draw.findMany({
            where: { game },
            orderBy: { date: 'asc' }
        });

        console.log(`📊 Loaded ${draws.length} draws from local SQLite.`);
        const { maxNum, maxStar } = GAME_CONFIGS[game];

        // Numbers
        for (let i = 0; i < draws.length; i++) {
            const currentDraw = draws[i];
            const history = draws.slice(0, i);
            if (history.length < 15) continue;

            const prediction = await numSys.generateTop10(history as any, true);
            const actual = typeof currentDraw.numbers === 'string'
                ? JSON.parse(currentDraw.numbers)
                : (Array.isArray(currentDraw.numbers) ? currentDraw.numbers : []);
            const hits = calculateNumberHits(prediction, actual);

            const existing = await prisma.systemPrediction.findFirst({
                where: {
                    drawId: currentDraw.id,
                    systemName: 'Matriz de Corte',
                    game,
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
                        drawId: currentDraw.id,
                        game,
                        systemName: 'Matriz de Corte',
                        domain: 'NUMBERS',
                        ...data
                    }
                });
            }
        }
        console.log(`✅ ${game} Numbers updated in SQLite.`);

        // Stars
        if (maxStar > 0) {
            for (let i = 0; i < draws.length; i++) {
                const currentDraw = draws[i];
                const history = draws.slice(0, i);
                if (history.length < 15) continue;

                const prediction = starSys.generatePrediction(history as any, true);
                const actual = typeof currentDraw.stars === 'string'
                    ? JSON.parse(currentDraw.stars)
                    : (Array.isArray(currentDraw.stars) ? currentDraw.stars : []);
                const hits = calculateStarHits(prediction, actual);

                const existing = await prisma.systemPrediction.findFirst({
                    where: {
                        drawId: currentDraw.id,
                        systemName: 'Matriz de Corte Estrelas',
                        game,
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
                            drawId: currentDraw.id,
                            game,
                            systemName: 'Matriz de Corte Estrelas',
                            domain: 'STARS',
                            ...data
                        }
                    });
                }
            }
            console.log(`✅ ${game} Stars updated in SQLite.`);
        }
    }

    await prisma.$disconnect();
    console.log(`🎉 LOCAL SQLITE BACKFILL COMPLETE!`);
}

backfillLocalSQLite().catch(console.error);
