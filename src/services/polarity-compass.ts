import fs from 'fs';
import path from 'path';
import { prisma } from '@/lib/prisma';
import { calculateMatrizCorte } from '@/services/matriz-corte-engine';
import {
    PolarityMetrics,
    PolarityRankingItem,
    SystemFamilyConfig,
    SYSTEM_FAMILIES,
    NextDrawSuggestionItem
} from '@/types/polarity';

export type {
    PolarityMetrics,
    PolarityRankingItem,
    SystemFamilyConfig,
    NextDrawSuggestionItem
};
export { SYSTEM_FAMILIES };

export const SYSTEMS_META: Record<string, { name: string; family: 'INERTIA' | 'GEOMETRY' | 'CYCLES' | 'INTELLIGENCE' }> = {
    separacao_aguas: { name: 'Separação das Águas', family: 'INTELLIGENCE' },
    tiro_certeiro: { name: 'Tiro Certeiro', family: 'INTELLIGENCE' },
    supersistema_neuronal: { name: 'SuperSistema Neuronal', family: 'INTELLIGENCE' },
    random_forest: { name: 'Random Forest AI', family: 'INTELLIGENCE' },
    matriz_corte: { name: 'Matriz de Corte (Via Negativa)', family: 'INTELLIGENCE' },
    mais_quentes: { name: 'Mais Quentes (Hot)', family: 'INERTIA' },
    ultimos_a_sair: { name: 'Últimos a Sair', family: 'INERTIA' },
    media_3_otimizado: { name: 'Média 3 Otimizado', family: 'INERTIA' },
    mais_sorteadas_sempre: { name: 'Mais Sorteadas de Sempre', family: 'INERTIA' },
    diagonais_matriz: { name: 'Diagonais da Matriz 2D', family: 'GEOMETRY' },
    diagonais_matriz_3d: { name: 'Diagonais da Matriz 3D', family: 'GEOMETRY' },
    piramide_pascal: { name: 'Pirâmide de Pascal', family: 'GEOMETRY' },
    piramide_intervalos: { name: 'Pirâmide de Intervalos', family: 'GEOMETRY' },
    oscilacao_universal: { name: 'Sistema Oscilação Universal V2', family: 'CYCLES' },
    markov: { name: 'Transições de Markov', family: 'CYCLES' },
    clustering: { name: 'Agrupamento (Clustering)', family: 'CYCLES' },
    monte_carlo: { name: 'Simulação Monte Carlo', family: 'CYCLES' }
};

const BASELINES: Record<string, { totalBalls: number; pickSize: number; halfSize: number }> = {
    EUROMILLIONS: { totalBalls: 50, pickSize: 5, halfSize: 25 },
    TOTOLOTO: { totalBalls: 49, pickSize: 5, halfSize: 25 },
    EURODREAMS: { totalBalls: 40, pickSize: 6, halfSize: 20 },
    MEGASENA: { totalBalls: 60, pickSize: 6, halfSize: 30 }
};

export async function calculateSystemPolarity(
    gameKey: string,
    systemSlug: string
): Promise<PolarityMetrics> {
    const game = gameKey.toUpperCase();
    const config = BASELINES[game] || BASELINES.EUROMILLIONS;
    const sysMeta = SYSTEMS_META[systemSlug] || { name: systemSlug, family: 'INTELLIGENCE' };

    // 1. Ler dados consolidados
    const fileName = `${systemSlug}_${game.toLowerCase()}.json`;
    const filePath = path.join(process.cwd(), 'data', 'consolidated', fileName);

    let historicalData: any[] = [];
    if (fs.existsSync(filePath)) {
        try {
            historicalData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        } catch (e) {
            console.error(`Erro ao ler ${fileName}:`, e);
            historicalData = [];
        }
    }

    // Identificar último drawId consolidado
    let maxDrawId = 0;
    if (historicalData.length > 0) {
        maxDrawId = Math.max(...historicalData.map(d => d.drawId || 0));
    }

    // 2. Procurar novos sorteios delta na base de dados
    let deltaDraws: any[] = [];
    try {
        deltaDraws = await prisma.draw.findMany({
            where: {
                game,
                id: { gt: maxDrawId }
            },
            orderBy: { id: 'asc' },
            select: { id: true, date: true, numbers: true }
        });
    } catch {
        deltaDraws = [];
    }

    // Obter predições delta da tabela system_predictions se existirem
    const allDrawsEvaluated: {
        drawId: number;
        date: string;
        numbers: number[];
        prediction: number[];
        hitsTop: number;
        hitsBottom: number;
    }[] = [];

    // Parse histórico consolidado
    for (const item of historicalData) {
        let drawNums: number[] = [];
        try {
            drawNums = typeof item.draw?.numbers === 'string' ? JSON.parse(item.draw.numbers) : item.draw?.numbers || [];
        } catch {
            drawNums = [];
        }
        let pred: number[] = [];
        try {
            pred = typeof item.prediction === 'string' ? JSON.parse(item.prediction) : item.prediction || [];
        } catch {
            pred = [];
        }

        const hitsTop = item.num_hits_25 !== undefined ? item.num_hits_25 : (
            game === 'EURODREAMS' ? (item.num_hits_20 || 0) : (
                game === 'MEGASENA' ? (item.num_hits_30 || 0) : 0
            )
        );
        const hitsBottom = Math.max(0, config.pickSize - hitsTop);

        allDrawsEvaluated.push({
            drawId: item.drawId,
            date: item.draw?.date || '',
            numbers: drawNums,
            prediction: pred,
            hitsTop,
            hitsBottom
        });
    }

    // Delta draws merge
    if (deltaDraws.length > 0) {
        for (const dd of deltaDraws) {
            let nums: number[] = [];
            try {
                nums = typeof dd.numbers === 'string' ? JSON.parse(dd.numbers) : dd.numbers || [];
            } catch {
                nums = [];
            }
            if (nums.length < config.pickSize) continue;

            // Procurar na SystemPrediction se existe predição registada
            let pred: number[] = [];
            let hTop = 0;
            try {
                const sp = await prisma.systemPrediction.findFirst({
                    where: {
                        drawId: dd.id,
                        game,
                        systemName: sysMeta.name,
                        domain: 'NUMBERS'
                    }
                });
                if (sp) {
                    pred = typeof sp.prediction === 'string' ? JSON.parse(sp.prediction) : sp.prediction;
                    hTop = sp.num_hits_25 ?? (
                        game === 'EURODREAMS' ? (sp.num_hits_20 ?? 0) : (
                            game === 'MEGASENA' ? (sp.num_hits_30 ?? 0) : 0
                        )
                    );
                }
            } catch {
                // Ignore DB error
            }

            if (pred.length === 0 && allDrawsEvaluated.length > 0) {
                // Fallback: usar a última predição disponível
                pred = allDrawsEvaluated[allDrawsEvaluated.length - 1].prediction;
                const topSet = new Set(pred.slice(0, config.halfSize));
                hTop = nums.filter(n => topSet.has(n)).length;
            }

            const hBottom = Math.max(0, config.pickSize - hTop);
            allDrawsEvaluated.push({
                drawId: dd.id,
                date: dd.date instanceof Date ? dd.date.toISOString() : String(dd.date),
                numbers: nums,
                prediction: pred,
                hitsTop: hTop,
                hitsBottom: hBottom
            });
        }
    }

    const totalDraws = allDrawsEvaluated.length;
    let directJackpots = 0;
    let mirrorJackpots = 0;
    let directTraves = 0;
    let mirrorTraves = 0;
    let centralNoiseCount = 0;

    let lastDirectJackpotIdx = -1;
    let lastMirrorJackpotIdx = -1;

    for (let i = 0; i < totalDraws; i++) {
        const item = allDrawsEvaluated[i];
        if (item.hitsTop === config.pickSize) {
            directJackpots++;
            lastDirectJackpotIdx = i;
        } else if (item.hitsBottom === config.pickSize) {
            mirrorJackpots++;
            lastMirrorJackpotIdx = i;
        }

        if (item.hitsTop === config.pickSize - 1) {
            directTraves++;
        } else if (item.hitsBottom === config.pickSize - 1) {
            mirrorTraves++;
        }

        if (config.pickSize === 5) {
            if (item.hitsTop === 3 || item.hitsTop === 2) centralNoiseCount++;
        } else if (config.pickSize === 6) {
            if (item.hitsTop === 3 || item.hitsTop === 4 || item.hitsTop === 2) centralNoiseCount++;
        }
    }

    const directDelay = lastDirectJackpotIdx >= 0 ? totalDraws - 1 - lastDirectJackpotIdx : totalDraws;
    const mirrorDelay = lastMirrorJackpotIdx >= 0 ? totalDraws - 1 - lastMirrorJackpotIdx : totalDraws;

    const directMeanCycle = directJackpots > 0 ? Math.round((totalDraws / directJackpots) * 10) / 10 : totalDraws;
    const mirrorMeanCycle = mirrorJackpots > 0 ? Math.round((totalDraws / mirrorJackpots) * 10) / 10 : totalDraws;

    const directJpi = directMeanCycle > 0 ? Math.round((directDelay / directMeanCycle) * 100) / 100 : 0;
    const mirrorJpi = mirrorMeanCycle > 0 ? Math.round((mirrorDelay / mirrorMeanCycle) * 100) / 100 : 0;

    // Pressão Recente (últimos 5 e 10 sorteios)
    const last5 = allDrawsEvaluated.slice(-5);
    const last10 = allDrawsEvaluated.slice(-10);

    const directTravesLast5 = last5.filter(d => d.hitsTop === config.pickSize - 1).length;
    const mirrorTravesLast5 = last5.filter(d => d.hitsBottom === config.pickSize - 1).length;

    const directTravesLast10 = last10.filter(d => d.hitsTop === config.pickSize - 1).length;
    const mirrorTravesLast10 = last10.filter(d => d.hitsBottom === config.pickSize - 1).length;

    // Pêndulo recente (últimos 3 sorteios)
    const last3 = allDrawsEvaluated.slice(-3);
    const avgHitsTopLast3 = last3.length > 0 ? last3.reduce((acc, d) => acc + d.hitsTop, 0) / last3.length : 2.5;

    let recentTrend: 'DIRECT_HOT' | 'MIRROR_HOT' | 'NEUTRAL' = 'NEUTRAL';
    if (avgHitsTopLast3 >= 3.2) recentTrend = 'DIRECT_HOT';
    else if (avgHitsTopLast3 <= 1.8) recentTrend = 'MIRROR_HOT';

    // Cálculo da Bússola e Pontuação de Polaridade
    let scoreDirect = 50;
    let scoreMirror = 50;

    // Factor 1: Maturação JPI (Zona Áurea 0.75 - 1.25)
    if (directJpi >= 0.75 && directJpi <= 1.25) scoreDirect += 35;
    else if (directJpi > 1.5) scoreDirect -= 15;

    if (mirrorJpi >= 0.75 && mirrorJpi <= 1.25) scoreMirror += 35;
    else if (mirrorJpi > 1.5) scoreMirror -= 15;

    // Factor 2: Traves nas pontas (Abalos premonitórios de Nazaré)
    scoreDirect += directTravesLast5 * 25;
    scoreMirror += mirrorTravesLast5 * 25;

    // Factor 3: Pêndulo
    if (recentTrend === 'DIRECT_HOT') scoreDirect += 10;
    if (recentTrend === 'MIRROR_HOT') scoreMirror += 10;

    let recommendation: 'DIRECT' | 'MIRROR' | 'NEUTRAL' = 'NEUTRAL';
    let confidence = 50;
    let headline = '⚖️ Polaridade Equilibrada';
    let explanation = 'As duas metades do sistema apresentam ciclos estáveis sem desvio crítico.';

    if (scoreDirect >= scoreMirror + 20) {
        recommendation = 'DIRECT';
        confidence = Math.min(95, 60 + Math.round((scoreDirect - scoreMirror) * 0.7));
        headline = '☀️ JOGAR DIRETO (1ª Metade)';
        explanation = `Ciclo maduro no Direto (Atraso ${directDelay} sorteios vs média de ${directMeanCycle}), com ${directTravesLast5} quase-jackpot(s) recentes a sinalizar rutura iminente.`;
    } else if (scoreMirror >= scoreDirect + 20) {
        recommendation = 'MIRROR';
        confidence = Math.min(95, 60 + Math.round((scoreMirror - scoreDirect) * 0.7));
        headline = '🌑 JOGAR ESPELHO / ANTI-SISTEMA (2ª Metade)';
        explanation = `O momento estatístico favorece o Anti-Sistema (Atraso Espelho de ${mirrorDelay} sorteios vs média de ${mirrorMeanCycle}), com ${mirrorTravesLast5} trave(s) de espelho recentes.`;
    }

    const extremeSeparationRate = totalDraws > 0 ? Math.round(((directJackpots + mirrorJackpots + directTraves + mirrorTraves) / totalDraws) * 1000) / 10 : 0;
    const centralNoiseRate = totalDraws > 0 ? Math.round((centralNoiseCount / totalDraws) * 1000) / 10 : 0;

    // Predição Atual
    const latestItem = allDrawsEvaluated[allDrawsEvaluated.length - 1];
    let fullPool = latestItem?.prediction || [];
    if (fullPool.length === 0) {
        fullPool = Array.from({ length: config.totalBalls }, (_, i) => i + 1);
    }

    const directNumbers = fullPool.slice(0, config.halfSize);
    // Espelho: a 2ª metade do array, invertida (o 50º número é a bola nº 1 do anti-sistema)
    const mirrorNumbers = fullPool.slice(config.halfSize).reverse();

    return {
        game,
        systemSlug,
        systemName: sysMeta.name,
        family: sysMeta.family,
        totalDraws,
        pickSize: config.pickSize,
        halfSize: config.halfSize,
        directJackpots,
        mirrorJackpots,
        totalExtremeJackpots: directJackpots + mirrorJackpots,
        directTraves,
        mirrorTraves,
        totalExtremeTraves: directTraves + mirrorTraves,
        centralNoiseCount,
        extremeSeparationRate,
        centralNoiseRate,
        directMeanCycle,
        mirrorMeanCycle,
        directDelay,
        mirrorDelay,
        directJpi,
        mirrorJpi,
        directTravesLast5,
        mirrorTravesLast5,
        directTravesLast10,
        mirrorTravesLast10,
        recentTrend,
        recommendation,
        confidence,
        headline,
        explanation,
        lastUpdatedDate: latestItem?.date,
        fullPoolPrediction: fullPool,
        directNumbers,
        mirrorNumbers
    };
}

export async function getPolarityRanking(gameKey: string): Promise<PolarityRankingItem[]> {
    const game = gameKey.toUpperCase();
    const slugs = Object.keys(SYSTEMS_META);

    const list: PolarityRankingItem[] = [];
    for (const slug of slugs) {
        try {
            const pol = await calculateSystemPolarity(game, slug);
            list.push({
                systemSlug: slug,
                systemName: pol.systemName,
                family: pol.family,
                directJackpots: pol.directJackpots,
                mirrorJackpots: pol.mirrorJackpots,
                totalExtremeJackpots: pol.totalExtremeJackpots,
                extremeSeparationRate: pol.extremeSeparationRate,
                centralNoiseRate: pol.centralNoiseRate,
                directDelay: pol.directDelay,
                mirrorDelay: pol.mirrorDelay,
                directMeanCycle: pol.directMeanCycle,
                mirrorMeanCycle: pol.mirrorMeanCycle,
                recommendation: pol.recommendation,
                confidence: pol.confidence
            });
        } catch {
            // Skip systems without file
        }
    }

    // Ordenar pelo índice de extremos: maior separação e menor ruído
    list.sort((a, b) => b.extremeSeparationRate - a.extremeSeparationRate);
    return list;
}

export async function getNextDrawAllSuggestions(gameKey: string): Promise<NextDrawSuggestionItem[]> {
    const game = gameKey.toUpperCase();
    const slugs = Object.keys(SYSTEMS_META);

    const items: NextDrawSuggestionItem[] = [];
    for (const slug of slugs) {
        try {
            const pol = await calculateSystemPolarity(game, slug);
            items.push({
                systemSlug: slug,
                systemName: pol.systemName,
                family: pol.family,
                top5: pol.fullPoolPrediction.slice(0, 5),
                top10: pol.fullPoolPrediction.slice(0, 10),
                topHalf: pol.directNumbers,
                mirrorHalf: pol.mirrorNumbers,
                recommendation: pol.recommendation
            });
        } catch {
            // ignore
        }
    }

    return items;
}
