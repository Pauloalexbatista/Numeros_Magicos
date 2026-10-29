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

async function saveToCachedPrediction(
    systemName: string,
    game: string,
    fullOrderedPool: number[],
    splitPoint: number,
    domain: 'NUMBERS' | 'STARS' = 'NUMBERS',
    systemType: string = 'BASE'
) {
    try {
        const topNumbers = fullOrderedPool.slice(0, splitPoint);
        const worstNumbers = fullOrderedPool.slice(splitPoint);

        await prisma.rankedSystem.upsert({
            where: { name_game: { name: systemName, game } },
            update: {},
            create: {
                name: systemName,
                game,
                domain,
                systemType,
                isActive: true,
                description: `Sistema ${systemName}`
            }
        });

        await prisma.cachedPrediction.upsert({
            where: {
                systemName_game: {
                    systemName,
                    game
                }
            },
            update: {
                numbers: JSON.stringify(topNumbers),
                worstNumbers: JSON.stringify(worstNumbers),
                updatedAt: new Date()
            },
            create: {
                game,
                systemName,
                numbers: JSON.stringify(topNumbers),
                worstNumbers: JSON.stringify(worstNumbers)
            }
        });
    } catch (err) {
        console.error(`[CachedPrediction] Error saving cache for ${systemName} (${game}):`, err);
    }
}

export async function readFromCachedPrediction(
    systemName: string,
    game: string
): Promise<number[] | null> {
    try {
        let cached = await prisma.cachedPrediction.findUnique({
            where: { systemName_game: { systemName, game } }
        });

        if (!cached) {
            const sNorm = norm(systemName);
            const allCached = await prisma.cachedPrediction.findMany({ where: { game } });
            cached = allCached.find(c => norm(c.systemName) === sNorm) || null;
        }

        if (cached && cached.numbers) {
            const top: number[] = JSON.parse(cached.numbers);
            const worst: number[] = cached.worstNumbers ? JSON.parse(cached.worstNumbers) : [];
            const combined = [...top, ...worst];
            if (combined.length > 0) {
                return combined;
            }
        }
    } catch (err) {
        console.error(`[CachedPrediction] Error reading cache for ${systemName} (${game}):`, err);
    }
    return null;
}

export async function getLiveNextPrediction(
    systemName: string,
    game: string = 'EUROMILLIONS',
    cachedHistory?: Draw[],
    forceGenerateAndSave: boolean = false
): Promise<number[]> {
    const maxNum = game === 'EUROMILLIONS' ? 50 : game === 'TOTOLOTO' ? 49 : game === 'EURODREAMS' ? 40 : game === 'LOTOFACIL' ? 25 : 60;
    const halfPoint = game === 'EURODREAMS' ? 20 : game === 'MEGASENA' ? 30 : game === 'LOTOFACIL' ? 20 : 25;

    // 0. REGRA DE OURO: Se não foi pedido histórico customizado nem forceGenerateAndSave,
    // LER SEMPRE E EXCLUSIVAMENTE DA BASE DE DADOS (CachedPrediction)
    if (!cachedHistory && !forceGenerateAndSave) {
        const stored = await readFromCachedPrediction(systemName, game);
        if (stored && stored.length > 0) {
            return stored;
        }
    }

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
            // Ler sempre a previsão já gravada na BD para o especialista (ou se cachedHistory foi passado em backtest, usar esse)
            const pred = cachedHistory
                ? await getLiveNextPrediction(specName, game, history, false)
                : await getLiveNextPrediction(specName, game, undefined, false);
            specPreds.push(pred);
        }
        const combined = new TiroCerteiro().combineSpecialists(specPreds, maxNum, halfPoint, game);
        if (!cachedHistory) {
            await saveToCachedPrediction('Tiro Certeiro', game, combined, halfPoint, 'NUMBERS', 'META');
        }
        return combined;
    }

    // 2. Check if Meta-System: Separação das Águas
    if (sNorm.includes('separacao') && sNorm.includes('aguas')) {
        const specialists = SEPARACAO_AGUAS_SPECIALISTS[game] || [];
        const specPreds: number[][] = [];
        for (const specName of specialists) {
            const pred = cachedHistory
                ? await getLiveNextPrediction(specName, game, history, false)
                : await getLiveNextPrediction(specName, game, undefined, false);
            specPreds.push(pred);
        }
        const combined = new SeparacaoAguas().combineSpecialists(specPreds, maxNum, halfPoint);
        if (!cachedHistory) {
            await saveToCachedPrediction('Separação das Águas', game, combined, halfPoint, 'NUMBERS', 'META');
        }
        return combined;
    }

    // 3. Check if Meta-System: SuperSistema Neuronal
    if (sNorm.includes('supersistema') || sNorm.includes('super sistema')) {
        const specialists = SUPER_SISTEMA_SPECIALISTS[game] || [];
        const specPreds: number[][] = [];
        for (const specName of specialists) {
            const pred = cachedHistory
                ? await getLiveNextPrediction(specName, game, history, false)
                : await getLiveNextPrediction(specName, game, undefined, false);
            specPreds.push(pred);
        }
        const combined = new SuperSistemaNeuronal().combineSpecialists(specPreds, maxNum, halfPoint);
        if (!cachedHistory) {
            await saveToCachedPrediction('SuperSistema Neuronal', game, combined, halfPoint, 'NUMBERS', 'META');
        }
        return combined;
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
                const fullPool = [...valid, ...missing];
                if (!cachedHistory) {
                    await saveToCachedPrediction(sys.name, game, fullPool, halfPoint, 'NUMBERS', sys.type || 'BASE');
                }
                return fullPool;
            }
        } catch (err) {
            console.error('Error generating prediction for ' + systemName + ':', err);
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
    cachedHistory?: Draw[],
    forceGenerateAndSave: boolean = false
): Promise<number[]> {
    const maxStarMap: Record<string, number> = {
        'EUROMILLIONS': 12,
        'TOTOLOTO': 13,
        'EURODREAMS': 5,
        'MEGASENA': 0,
        'LOTOFACIL': 0
    };
    const maxStar = maxStarMap[game] ?? 12;
    if (maxStar === 0) return [];

    const suggestedCount = game === 'EUROMILLIONS' ? 4 : 2;

    // 0. REGRA DE OURO: Ler SEMPRE da BD (CachedPrediction) se não for pedido forceGenerateAndSave
    if (!cachedHistory && !forceGenerateAndSave) {
        const stored = await readFromCachedPrediction(systemName, game);
        if (stored && stored.length > 0) {
            return stored;
        }
    }

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
            console.error('Error generating star prediction for ' + systemName + ':', e);
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

    const fullStarPool = [...prediction, ...missing];
    if (!cachedHistory && sys) {
        await saveToCachedPrediction(sys.name, game, fullStarPool, suggestedCount, 'STARS', sys.type || 'BASE');
    }
    return fullStarPool;
}

/**
 * Calcula 1 única vez e grava em CachedPrediction todas as previsões (Base, Meta e Estrelas)
 * para o próximo sorteio de um determinado jogo.
 */
export async function generateAndCacheAllNextPredictions(game: string) {
    console.log(`🔒 [CachedPrediction] Gerando e selando previsões do próximo sorteio para ${game}...`);
    const history = await prisma.draw.findMany({
        where: { game },
        orderBy: { date: 'desc' }
    });
    if (!history || history.length === 0) return;

    const maxNum = game === 'EUROMILLIONS' ? 50 : game === 'TOTOLOTO' ? 49 : game === 'EURODREAMS' ? 40 : game === 'LOTOFACIL' ? 25 : 60;
    const halfPoint = game === 'EURODREAMS' ? 20 : game === 'MEGASENA' ? 30 : game === 'LOTOFACIL' ? 20 : 25;

    let baseSystems: any[] = rankedSystems;
    if (game === 'TOTOLOTO') baseSystems = totolotoRankedSystems;
    if (game === 'EURODREAMS') baseSystems = euroDreamsRankedSystems;

    // 1. Calcular e gravar todos os Sistemas Base de Números (1 única vez)
    for (const sys of baseSystems) {
        try {
            let res: number[] = [];
            if (typeof sys.generatePrediction === 'function') {
                res = await sys.generatePrediction(history, true);
            } else if (typeof sys.generateTop10 === 'function') {
                res = await sys.generateTop10(history, true);
            }
            const valid = (res || []).filter((n: number) => n >= 1 && n <= maxNum);
            const missing: number[] = [];
            for (let i = 1; i <= maxNum; i++) {
                if (!valid.includes(i)) missing.push(i);
            }
            const fullPool = [...valid, ...missing];
            await saveToCachedPrediction(sys.name, game, fullPool, halfPoint, 'NUMBERS', sys.type || 'BASE');
        } catch (err) {
            console.error(`[CachedPrediction] Erro ao gerar base ${sys.name} (${game}):`, err);
        }
    }

    // 2. Calcular e gravar os Meta-Sistemas lendo ESTRITAMENTE da BD (CachedPrediction dos especialistas)
    const metaSystems = ['Tiro Certeiro', 'Separação das Águas', 'SuperSistema Neuronal'];
    for (const metaName of metaSystems) {
        try {
            await getLiveNextPrediction(metaName, game, undefined, true);
        } catch (err) {
            console.error(`[CachedPrediction] Erro ao gerar meta ${metaName} (${game}):`, err);
        }
    }

    // 3. Calcular e gravar todos os Sistemas de Estrelas / N.º da Sorte / Sonho (1 única vez)
    if (game === 'EUROMILLIONS' || game === 'TOTOLOTO' || game === 'EURODREAMS') {
        let sList: any[] = starSystems;
        if (game === 'TOTOLOTO') sList = totolotoStarSystems;
        if (game === 'EURODREAMS') sList = euroDreamsStarSystems;

        for (const sSys of sList) {
            try {
                await getLiveNextStarPrediction(sSys.name, game, undefined, true);
            } catch (err) {
                console.error(`[CachedPrediction] Erro ao gerar estrelas ${sSys.name} (${game}):`, err);
            }
        }
    }
    console.log(`✅ [CachedPrediction] Todas as previsões para o próximo sorteio de ${game} foram seladas na BD.`);
}
