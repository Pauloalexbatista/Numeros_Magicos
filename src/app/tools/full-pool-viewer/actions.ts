'use server';

import { prisma } from '@/lib/prisma';

export interface FullPoolIntervalStat {
    intervalLabel: string;
    totalHits: number;
    avgHitsPerDraw: number;
    efficiency: number;
}

export interface FullPoolRecentDraw {
    date: string;
    actualNumbers: number[];
    hitsByInterval: Record<string, number>;
}

export interface FullPoolStatsResult {
    intervals: FullPoolIntervalStat[];
    recentDraws: FullPoolRecentDraw[];
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

        // Intervals: 1-10, 11-20, 21-30, 31-40, 41-50
        const intervalDefinitions = [
            { label: 'Top 1-10', start: 0, end: 10 },
            { label: 'Top 11-20', start: 10, end: 20 },
            { label: 'Top 21-30', start: 20, end: 30 },
            { label: 'Top 31-40', start: 30, end: 40 },
            { label: 'Top 41-50', start: 40, end: 50 },
            { label: 'Top 1-25 (Legacy)', start: 0, end: 25 },
            { label: 'Bottom 26-50', start: 25, end: 50 }
        ];

        let intervalTotals = new Array(intervalDefinitions.length).fill(0);
        let recentDraws: FullPoolRecentDraw[] = [];

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

            if (idx < 20) {
                recentDraws.push({
                    date: record.draw.date.toISOString(),
                    actualNumbers: actual,
                    hitsByInterval: drawHits
                });
            }
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
            recentDraws,
            totalDrawsAnalyzed: totalDraws
        };

    } catch (e) {
        console.error("Error calculating full pool stats:", e);
        return null;
    }
}