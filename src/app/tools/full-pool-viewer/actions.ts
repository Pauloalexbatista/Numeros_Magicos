'use server';

import { prisma } from '@/lib/prisma';

export interface FullPoolIntervalStat {
    intervalLabel: string;
    totalHits: number;
    avgHitsPerDraw: number;
    efficiency: number;
    hitsDistribution: Record<number, number>; // counts of draws with 0, 1, 2, 3, 4, 5, 6 hits
}

export interface FullPoolDrawData {
    date: string;
    actualNumbers: number[];
    hitsByInterval: Record<string, number>;
}

export interface FullPoolStatsResult {
    intervals: FullPoolIntervalStat[];
    allDraws: FullPoolDrawData[];
    totalDrawsAnalyzed: number;
}

export async function getAvailableSystemsForFullPool() {
    try {
        const records = await prisma.systemPrediction.findMany({
            where: { domain: 'NUMBERS' },
            select: {
                game: true,
                systemName: true
            },
            distinct: ['game', 'systemName']
        });
        
        return records.map(r => ({ game: r.game, systemName: r.systemName }));
    } catch (e) {
        console.error("Error getting full pool systems:", e);
        return [];
    }
}

export async function getFullPoolStats(game: string, systemName: string): Promise<FullPoolStatsResult | null> {
    try {
        const records = await prisma.systemPrediction.findMany({
            where: { game, systemName, domain: 'NUMBERS' },
            orderBy: { draw: { date: 'desc' } },
            include: { draw: { select: { date: true, numbers: true } } }
        });

        if (records.length === 0) return null;

        const maxNumbersToDraw = (game === 'EURODREAMS' || game === 'MEGASENA') ? 6 : 5;

        // Determinar o tamanho total da pool com base no jogo
        let poolSize = 50;
        if (game === 'EURODREAMS') poolSize = 40;
        else if (game === 'MEGASENA') poolSize = 60;
        else if (game === 'TOTOLOTO') poolSize = 49;

        // Gerar intervalos dinâmicos de 5
        const intervalDefinitions: { label: string; start: number; end: number }[] = [];
        for (let start = 0; start < poolSize; start += 5) {
            const end = Math.min(start + 5, poolSize);
            intervalDefinitions.push({
                label: `Top ${start + 1}-${end}`,
                start,
                end
            });
        }

        let intervalTotals = new Array(intervalDefinitions.length).fill(0);
        let intervalDistributions: Record<number, number>[] = intervalDefinitions.map(() => ({
            0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0
        }));

        let allDraws: FullPoolDrawData[] = [];

        records.forEach((record) => {
            if (!record.draw) return;

            let pred: number[] = [];
            try {
                pred = typeof record.prediction === 'string' ? JSON.parse(record.prediction) : record.prediction;
            } catch {
                pred = [];
            }

            let actual: number[] = [];
            try {
                actual = typeof record.draw.numbers === 'string' ? JSON.parse(record.draw.numbers) : record.draw.numbers;
            } catch {
                actual = [];
            }
            
            let drawHits: Record<string, number> = {};

            intervalDefinitions.forEach((def, defIdx) => {
                const slice = pred.slice(def.start, def.end);
                const hits = actual.filter((n: number) => slice.includes(n)).length;
                intervalTotals[defIdx] += hits;
                intervalDistributions[defIdx][hits] = (intervalDistributions[defIdx][hits] || 0) + 1;
                drawHits[def.label] = hits;
            });

            allDraws.push({
                date: record.draw.date.toISOString(),
                actualNumbers: actual,
                hitsByInterval: drawHits
            });
        });

        const totalDraws = allDraws.length;
        if (totalDraws === 0) return null;

        const totalBallsDrawn = totalDraws * maxNumbersToDraw;

        const intervals: FullPoolIntervalStat[] = intervalDefinitions.map((def, idx) => {
            const totalHits = intervalTotals[idx];
            return {
                intervalLabel: def.label,
                totalHits,
                avgHitsPerDraw: totalHits / totalDraws,
                efficiency: (totalHits / totalBallsDrawn) * 100,
                hitsDistribution: intervalDistributions[idx]
            };
        });

        return {
            intervals,
            allDraws,
            totalDrawsAnalyzed: totalDraws
        };

    } catch (e) {
        console.error("Error calculating full pool stats:", e);
        return null;
    }
}
