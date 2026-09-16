
import { prisma } from '@/lib/prisma';
import { rankedSystems, starSystems } from './ranking';
import { totolotoRankedSystems, totolotoStarSystems } from './totoloto-systems';
import { euroDreamsRankedSystems, euroDreamsStarSystems } from './ranking';
import { TiroCerteiro, TIRO_CERTEIRO_SPECIALISTS } from './tiro-certeiro';
import { SeparacaoAguas, SEPARACAO_AGUAS_SPECIALISTS } from './separacao-aguas';
import { SuperSistemaNeuronal, SUPER_SISTEMA_SPECIALISTS } from './supersistema-neuronal';

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

    // Auto-evaluate Meta-Systems (Tiro Certeiro, Separação das Águas, SuperSistema Neuronal)
    await evaluateMetaSystems(draw.id, draw.game, actual);
}

async function evaluateMetaSystems(drawId: number, game: string, actual: number[]) {
    try {
        const maxNum = game === 'EUROMILLIONS' ? 50 : game === 'TOTOLOTO' ? 49 : game === 'EURODREAMS' ? 40 : 60;
        const halfPoint = game === 'EURODREAMS' ? 20 : game === 'MEGASENA' ? 30 : 25;

        const existingPreds = await prisma.systemPrediction.findMany({
            where: { drawId, domain: 'NUMBERS' }
        });

        const predMap = new Map<string, number[]>();
        for (const p of existingPreds) {
            try {
                const arr = typeof p.prediction === 'string' ? JSON.parse(p.prediction) : p.prediction;
                if (Array.isArray(arr)) {
                    predMap.set(p.systemName, arr);
                }
            } catch (e) {}
        }

        const norm = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
        const findPred = (name: string): number[] | undefined => {
            if (predMap.has(name)) return predMap.get(name);
            const targetNorm = norm(name);
            for (const [k, v] of Array.from(predMap.entries())) {
                if (norm(k) === targetNorm) return v;
            }
            return undefined;
        };

        const metaConfigs = [
            {
                name: 'Tiro Certeiro',
                specialists: TIRO_CERTEIRO_SPECIALISTS[game] || [],
                combine: (specs: number[][]) => new TiroCerteiro().combineSpecialists(specs, maxNum, halfPoint, game)
            },
            {
                name: 'Separação das Águas',
                specialists: SEPARACAO_AGUAS_SPECIALISTS[game] || [],
                combine: (specs: number[][]) => new SeparacaoAguas().combineSpecialists(specs, maxNum, halfPoint)
            },
            {
                name: 'SuperSistema Neuronal',
                specialists: SUPER_SISTEMA_SPECIALISTS[game] || [],
                combine: (specs: number[][]) => new SuperSistemaNeuronal().combineSpecialists(specs, maxNum, halfPoint)
            }
        ];

        for (const meta of metaConfigs) {
            try {
                const specs = meta.specialists.map(name => findPred(name));
                if (specs.some(s => !s)) {
                    console.warn(`[MetaSystems] Skipping ${meta.name} for draw ${drawId}: missing specialists`);
                    continue;
                }
                const validSpecs = specs as number[][];
                const prediction = meta.combine(validSpecs);
                const hits = calculateNumberHits(prediction, actual);

                const existing = await prisma.systemPrediction.findFirst({
                    where: { systemName: meta.name, drawId, domain: 'NUMBERS' }
                });

                const data = {
                    prediction: JSON.stringify(prediction),
                    cutoff: prediction.length,
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
                            systemName: meta.name,
                            drawId,
                            game,
                            domain: 'NUMBERS',
                            ...data
                        }
                    });
                }
                console.log(`[MetaSystems] Evaluated ${meta.name} for draw ${drawId} (${game})`);
            } catch (err) {
                console.error(`[MetaSystems] Error evaluating ${meta.name} for draw ${drawId}:`, err);
            }
        }
    } catch (outerErr) {
        console.error(`[MetaSystems] Failed to evaluate meta systems for draw ${drawId}:`, outerErr);
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
    
    // Defense-in-depth: Ensure history strictly precedes current draw by date and excludes self
    const currentDrawTime = new Date(draw.date).getTime();
    const history = draws.filter(d => d.id !== drawId && new Date(d.date).getTime() < currentDrawTime);

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

