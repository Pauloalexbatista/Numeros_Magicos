'use server';

import { prisma } from '@/lib/prisma';

export interface FullPoolIntervalStat {
    intervalLabel: string;
    totalHits: number;
    avgHitsPerDraw: number;
    efficiency: number;
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
        const records = await prisma.systemPerformanceFullPool.findMany({
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
        const records = await prisma.systemPerformanceFullPool.findMany({
            where: { game, systemName },
            orderBy: { draw: { date: 'desc' } },
            include: { draw: { select: { date: true } } }
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
        let allDraws: FullPoolDrawData[] = [];

        records.forEach((record, idx) => {
            const pred = JSON.parse(record.predictedNumbers);
            const actual = JSON.parse(record.actualNumbers);
            
            let drawHits: Record<string, number> = {};

            intervalDefinitions.forEach((def, defIdx) => {
                const slice = pred.slice(def.start, def.end);
                const hits = actual.filter((n: number) => slice.includes(n)).length;
                intervalTotals[defIdx] += hits;
                drawHits[def.label] = hits;
            });

            allDraws.push({
                date: record.draw.date.toISOString(),
                actualNumbers: actual,
                hitsByInterval: drawHits
            });
        });

        const totalDraws = records.length;
        const totalBallsDrawn = totalDraws * maxNumbersToDraw;

        const intervals: FullPoolIntervalStat[] = intervalDefinitions.map((def, idx) => {
            const totalHits = intervalTotals[idx];
            return {
                intervalLabel: def.label,
                totalHits,
                avgHitsPerDraw: totalHits / totalDraws,
                efficiency: (totalHits / totalBallsDrawn) * 100
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