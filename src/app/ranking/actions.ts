
'use server';

import { prisma } from '@/lib/prisma';

export type YearlyStat = {
    systemName: string;
    year: string;
    jackpots: number;
    highPrizes: number;
    rank?: number;
};

export async function getTopSystemsYearlyAnalysis() {
    // 1. Get Top 6 Systems
    const topRankings = await prisma.systemRanking.findMany({
        orderBy: { avgAccuracy: 'desc' },
        take: 6,
        select: { systemName: true, avgAccuracy: true }
    });

    const systems = topRankings.map(r => r.systemName);

    // 1.1 Also include Jackpot Leaders (so they appear in the table even if accuracy is lower)
    const jackpotLeaders = await getJackpotLeaders();
    const leaderNames = jackpotLeaders.map(l => l.systemName);

    // Merge and Deduplicate
    const allSystems = Array.from(new Set([...systems, ...leaderNames]));

    // 2. Get Performance Data
    const data = await prisma.systemPerformance.findMany({
        where: { systemName: { in: allSystems } },
        include: { draw: { select: { date: true } } }
    });

    const yearlyStats: Record<string, Record<string, { jackpots: number, highPrizes: number }>> = {};

    data.forEach(p => {
        const year = p.draw.date.getFullYear().toString();
        const sys = p.systemName;

        if (!yearlyStats[year]) yearlyStats[year] = {};
        if (!yearlyStats[year][sys]) yearlyStats[year][sys] = { jackpots: 0, highPrizes: 0 };

        if (p.hits === 5) yearlyStats[year][sys].jackpots++;
        if (p.hits === 4) yearlyStats[year][sys].highPrizes++;
    });

    // 3. Format for UI
    // We want the last 5 years
    const years = Object.keys(yearlyStats).sort().reverse().slice(0, 5);
    const result: Record<string, YearlyStat[]> = {};

    for (const year of years) {
        const stats = yearlyStats[year];
        const yearData: YearlyStat[] = [];

        for (const sys of allSystems) {
            const s = stats[sys] || { jackpots: 0, highPrizes: 0 };
            yearData.push({
                systemName: sys,
                year,
                jackpots: s.jackpots,
                highPrizes: s.highPrizes,
                rank: topRankings.findIndex(r => r.systemName === sys) + 1
            });
        }

        // Sort by Jackpots desc
        result[year] = yearData.sort((a, b) => (b.jackpots - a.jackpots) || (b.highPrizes - a.highPrizes));
    }

    return result;
}

export async function getJackpotLeaders() {
    const systems = await prisma.rankedSystem.findMany({
        where: { isActive: true },
        select: { name: true }
    });

    const leaders = [];

    for (const sys of systems) {
        const jackpots = await prisma.systemPerformance.count({
            where: {
                systemName: sys.name,
                hits: 5
            }
        });

        if (jackpots > 0) {
            leaders.push({ systemName: sys.name, jackpots });
        }
    }

    return leaders.sort((a, b) => b.jackpots - a.jackpots).slice(0, 3);
}
