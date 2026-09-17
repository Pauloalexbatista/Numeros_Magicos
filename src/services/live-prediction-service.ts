import { prisma } from '@/lib/prisma';
import { Draw } from '@prisma/client';
import { rankedSystems } from './ranked-systems';
import { totolotoRankedSystems, totolotoStarSystems } from './totoloto-systems';
import { euroDreamsRankedSystems, euroDreamsStarSystems } from './ranking';
import { starSystems } from './star-systems';
import { TiroCerteiro, TIRO_CERTEIRO_SPECIALISTS } from './tiro-certeiro';
import { SeparacaoAguas, SEPARACAO_AGUAS_SPECIALISTS } from './separacao-aguas';
import { SuperSistemaNeuronal, SUPER_SISTEMA_SPECIALISTS } from './supersistema-neuronal';

const norm = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");

export async function getLiveNextPrediction(
    systemName: string,
    game: string = 'EUROMILLIONS',
    cachedHistory?: Draw[]
): Promise<number[]> {
    const maxNum = game === 'EUROMILLIONS' ? 50 : game === 'TOTOLOTO' ? 49 : game === 'EURODREAMS' ? 40 : 60;
    const halfPoint = game === 'EURODREAMS' ? 20 : game === 'MEGASENA' ? 30 : 25;

    // Fetch history if not provided
    const history = cachedHistory || await prisma.draw.findMany({
        where: { game },
        orderBy: { date: 'desc' }
    });

    if (!history || history.length === 0) {
        return Array.from({ length: maxNum }, (_, i) => i + 1);
    }

    const sNorm = norm(systemName);

    // 1. Check if Meta-System: Tiro Certeiro
    if (sNorm.includes('tiro') && sNorm.includes('certeiro')) {
        const specialists = TIRO_CERTEIRO_SPECIALISTS[game] || [];
        const specPreds: number[][] = [];
        for (const specName of specialists) {
            const pred = await getLiveNextPrediction(specName, game, history);
            specPreds.push(pred);
        }
        return new TiroCerteiro().combineSpecialists(specPreds, maxNum, halfPoint, game);
    }

    // 2. Check if Meta-System: Separação das Águas
    if (sNorm.includes('separacao') && sNorm.includes('aguas')) {
        const specialists = SEPARACAO_AGUAS_SPECIALISTS[game] || [];
        const specPreds: number[][] = [];
        for (const specName of specialists) {
            const pred = await getLiveNextPrediction(specName, game, history);
            specPreds.push(pred);
        }
        return new SeparacaoAguas().combineSpecialists(specPreds, maxNum, halfPoint);
    }

    // 3. Check if Meta-System: SuperSistema Neuronal
    if (sNorm.includes('supersistema') || sNorm.includes('super sistema')) {
        const specialists = SUPER_SISTEMA_SPECIALISTS[game] || [];
        const specPreds: number[][] = [];
        for (const specName of specialists) {
            const pred = await getLiveNextPrediction(specName, game, history);
            specPreds.push(pred);
        }
        return new SuperSistemaNeuronal().combineSpecialists(specPreds, maxNum, halfPoint);
    }


    // 4. Base system lookup
    let systemsList: any[] = rankedSystems;
    if (game === 'TOTOLOTO') systemsList = totolotoRankedSystems;
    if (game === 'EURODREAMS') systemsList = euroDreamsRankedSystems;

    let sys = systemsList.find(s => norm(s.name) === sNorm);
    if (!sys) {
        sys = rankedSystems.find(s => norm(s.name) === sNorm);
    }

    if (sys) {
        try {
            let res: number[] = [];
            if (typeof sys.generatePrediction === 'function') {
                res = await sys.generatePrediction(history, true);
            } else if (typeof sys.generateTop10 === 'function') {
                res = await sys.generateTop10(history, true);
            }
            if (res && res.length > 0) {
                const valid = res.filter((n: number) => n >= 1 && n <= maxNum);
                const missing: number[] = [];
                for (let i = 1; i <= maxNum; i++) {
                    if (!valid.includes(i)) missing.push(i);
                }
                return [...valid, ...missing];
            }
        } catch (err) {
            console.error('Error generating live prediction for ' + systemName + ':', err);
        }
    }

    // Fallback: read from database last prediction or return sequential default
    const latestPred = await prisma.systemPrediction.findFirst({
        where: { systemName, game, domain: 'NUMBERS' },
        orderBy: { draw: { date: 'desc' } },
        select: { prediction: true }
    });
    if (latestPred?.prediction) {
        try {
            const parsed = JSON.parse(latestPred.prediction);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch (e) {}
    }

    return Array.from({ length: maxNum }, (_, i) => i + 1);
}

export async function getLiveNextStarPrediction(
    systemName: string,
    game: string = 'EUROMILLIONS',
    cachedHistory?: Draw[]
): Promise<number[]> {
    const maxStarMap: Record<string, number> = {
        'EUROMILLIONS': 12,
        'TOTOLOTO': 13,
        'EURODREAMS': 5,
        'MEGASENA': 0
    };
    const maxStar = maxStarMap[game] ?? 12;
    if (maxStar === 0) return [];

    const history = cachedHistory || await prisma.draw.findMany({
        where: { game },
        orderBy: { date: 'desc' }
    });

    if (!history || history.length === 0) {
        return Array.from({ length: maxStar }, (_, i) => i + 1);
    }

    const sNorm = norm(systemName);

    let starList: any[] = starSystems;
    if (game === 'TOTOLOTO') starList = totolotoStarSystems;
    if (game === 'EURODREAMS') starList = euroDreamsStarSystems;

    let sys = starList.find(s => norm(s.name) === sNorm);
    if (!sys) {
        sys = starSystems.find(s => norm(s.name) === sNorm);
    }

    let prediction: number[] = [];
    if (sys) {
        try {
            prediction = await sys.generatePrediction(history, true);
        } catch (e) {
            console.error('Error generating live star prediction for ' + systemName + ':', e);
        }
    }

    prediction = prediction.filter((n: number) => n >= 1 && n <= maxStar);
    const missing: number[] = [];
    for (let i = 1; i <= maxStar; i++) {
        if (!prediction.includes(i)) missing.push(i);
    }

    if (prediction.length === 0) {
        const cached = await prisma.systemPrediction.findFirst({
            where: { systemName, game, domain: 'STARS' },
            orderBy: { draw: { date: 'desc' } }
        });
        if (cached?.prediction) {
            try {
                const parsed = JSON.parse(cached.prediction);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            } catch (e) {}
        }
    }

    return [...prediction, ...missing];
}
