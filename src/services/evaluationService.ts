
import { prisma } from '@/lib/prisma';
import { rankedSystems, starSystems } from './ranking';
import { totolotoRankedSystems, totolotoStarSystems } from './totoloto-systems';
import { euroDreamsRankedSystems, euroDreamsStarSystems } from './ranking';

const calculateNumberHits = (prediction: number[], actual: number[]) => {
    const hits = {};
    for (let cut of [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60]) {
        const top = prediction.slice(0, cut);
        hits[`num_hits_${cut}`] = top.filter((n) => actual.includes(n)).length;
    }
    return hits;
};

const calculateStarHits = (prediction: number[], actual: number[]) => {
    const hits = {};
    for (let cut of [2, 4, 6, 8, 10, 12]) {
        const top = prediction.slice(0, cut);
        hits[`star_hits_${cut}`] = top.filter((n) => actual.includes(n)).length;
    }
    return hits;
};

export async function evaluateDraw(drawId: number) {
    const draw = await prisma.draw.findUnique({ where: { id: drawId } });
    if (!draw) return;

    console.log(`Evaluating NUMBERS for draw ${drawId} (${draw.game})`);

    const draws = await prisma.draw.findMany({
        where: { game: draw.game },
        orderBy: { date: 'desc' },
    });

    const drawIndex = draws.findIndex((d) => d.id === drawId);
    if (drawIndex === -1) return;
    
    // Defense-in-depth: Ensure history strictly precedes current draw by date and excludes self
    const currentDrawTime = new Date(draw.date).getTime();
    const history = draws.filter(d => d.id !== drawId && new Date(d.date).getTime() < currentDrawTime);

    let systems: any[] = [];
    if (draw.game === 'EUROMILLIONS') systems = rankedSystems;
    if (draw.game === 'TOTOLOTO') systems = totolotoRankedSystems;
    if (draw.game === 'EURODREAMS') systems = euroDreamsRankedSystems;
    if (draw.game === 'MEGASENA') systems = rankedSystems;

    const actual = draw.numbers ? (typeof draw.numbers === 'string' ? JSON.parse(draw.numbers) : draw.numbers) : [];

    for (const system of systems) {
        try {
            const prediction = await (system.generatePrediction ? system.generatePrediction(history, true) : system.generateTop10(history, true));
            const hits = calculateNumberHits(prediction, actual);

            const existing = await prisma.systemPrediction.findFirst({
                where: { systemName: system.name, drawId: draw.id, domain: 'NUMBERS' }
            });

            const data = {
                prediction: JSON.stringify(prediction),
                ...hits
            };

            if (existing) {
                await prisma.systemPrediction.update({
                    where: { id: existing.id },
                    data
                });
            } else {
                await prisma.systemPrediction.create({
                    data: {
                        systemName: system.name,
                        drawId: draw.id,
                        game: draw.game,
                        domain: 'NUMBERS',
                        cutoff: prediction.length,
                        ...data
                    }
                });
            }
        } catch (e) {
            console.error(`Error evaluating ${system.name} (NUMBERS) for draw ${draw.id}:`, e);
        }
    }
}

export async function evaluateDrawStars(drawId: number) {
    const draw = await prisma.draw.findUnique({ where: { id: drawId } });
    if (!draw) return;

    console.log(`Evaluating STARS for draw ${drawId} (${draw.game})`);

    const draws = await prisma.draw.findMany({
        where: { game: draw.game },
        orderBy: { date: 'desc' },
    });

    const drawIndex = draws.findIndex((d) => d.id === drawId);
    if (drawIndex === -1) return;
    
    const history = draws.slice(drawIndex + 1);

    let systems: any[] = [];
    if (draw.game === 'EUROMILLIONS') systems = starSystems;
    if (draw.game === 'TOTOLOTO') systems = totolotoStarSystems;
    if (draw.game === 'EURODREAMS') systems = euroDreamsStarSystems;

    const actual = draw.stars ? (typeof draw.stars === 'string' ? JSON.parse(draw.stars) : draw.stars) : [];

    for (const system of systems) {
        try {
            const prediction = await (system.generatePrediction ? system.generatePrediction(history, true) : system.generateTop10(history, true));
            const hits = calculateStarHits(prediction, actual);

            const existing = await prisma.systemPrediction.findFirst({
                where: { systemName: system.name, drawId: draw.id, domain: 'STARS' }
            });

            const data = {
                prediction: JSON.stringify(prediction),
                ...hits
            };

            if (existing) {
                await prisma.systemPrediction.update({
                    where: { id: existing.id },
                    data
                });
            } else {
                await prisma.systemPrediction.create({
                    data: {
                        systemName: system.name,
                        drawId: draw.id,
                        game: draw.game,
                        domain: 'STARS',
                        cutoff: prediction.length,
                        ...data
                    }
                });
            }
        } catch (e) {
            console.error(`Error evaluating ${system.name} (STARS) for draw ${draw.id}:`, e);
        }
    }
}

