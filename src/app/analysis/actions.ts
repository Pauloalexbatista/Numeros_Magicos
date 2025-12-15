'use server';

import { prisma } from '@/lib/prisma';
import { getCachedStatistics } from '@/services/cache/statisticsCache';
import { analyzeNumberProperties, analyzeStarPatterns, NumberPropertiesAnalysis, StarPatternStats, Draw } from '@/services/statistics';

/**
 * Get Analysis of Star Patterns.
 * Optimizes by checking the Global Cache first.
 */
export async function getStarAnalysis(): Promise<StarPatternStats | null> {
    try {
        // 1. Try Cache First (Global Stats)
        const cached = await getCachedStatistics<StarPatternStats>('GLOBAL_STAR_STATS');
        if (cached) {
            return cached;
        }

        // 2. Fallback: Calculate on Server (Full History)
        console.warn('⚠️ Star Stats Cache MISS. Calculating on server...');
        const history = await prisma.draw.findMany({
            orderBy: { date: 'desc' }
        });

        const statsDraws: Draw[] = history.map(d => ({
            ...d,
            date: d.date,
            numbers: JSON.parse(d.numbers),
            stars: JSON.parse(d.stars),
            numbersDrawOrder: d.numbersDrawOrder ? JSON.parse(d.numbersDrawOrder) : undefined,
            starsDrawOrder: d.starsDrawOrder ? JSON.parse(d.starsDrawOrder) : undefined
        }));

        return analyzeStarPatterns(statsDraws);

    } catch (error) {
        console.error('Failed to get star analysis:', error);
        return null;
    }
}

/**
 * Get Analysis of Number Properties.
 * Optimizes by checking Cache for full history, or calculating on server for subsets.
 */
export async function getNumberAnalysis(limit?: number): Promise<NumberPropertiesAnalysis | null> {
    try {
        const totalDraws = await prisma.draw.count();
        const requestLimit = limit || totalDraws;

        // 1. Try Cache if requesting Full History (or very close to it)
        if (requestLimit >= totalDraws - 5) {
            const cached = await getCachedStatistics<NumberPropertiesAnalysis>('GLOBAL_NUMBER_STATS');
            if (cached) {
                return cached;
            }
            console.warn('⚠️ Number Stats Cache MISS. Calculating on server...');
        }

        // 2. Calculate on Server (Subset or Fallback)
        const history = await prisma.draw.findMany({
            orderBy: { date: 'desc' },
            take: requestLimit
        });

        const statsDraws: Draw[] = history.map(d => ({
            ...d,
            date: d.date,
            numbers: JSON.parse(d.numbers),
            stars: JSON.parse(d.stars),
            numbersDrawOrder: d.numbersDrawOrder ? JSON.parse(d.numbersDrawOrder) : undefined,
            starsDrawOrder: d.starsDrawOrder ? JSON.parse(d.starsDrawOrder) : undefined
        }));

        return analyzeNumberProperties(statsDraws);

    } catch (error) {
        console.error('Failed to get number analysis:', error);
        return null;
    }
}
