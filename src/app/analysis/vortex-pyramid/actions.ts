'use server';

import { prisma } from '@/lib/prisma';
import { VortexPyramidSystem } from '@/services/vortex-pyramid';

import { getCachedStatistics, type StatisticsKey } from '@/services/cache/statisticsCache';

export interface VortexResonance {
    num: number;
    score: number;
}

export async function getVortexAnalysis(): Promise<VortexResonance[]> {
    try {
        // 1. Try Cache First
        const cached = await getCachedStatistics<VortexResonance[]>('VORTEX_RESONANCE_STATS');
        if (cached) {
            return cached;
        }

        // 2. Fallback: Run Analysis Manually
        console.warn('⚠️ Vortex Cache MISS. Running manual analysis (slow)...');

        const history = await prisma.draw.findMany({
            orderBy: { date: 'asc' },
            take: 300
        });

        if (history.length === 0) return [];

        const system = new VortexPyramidSystem();
        const results = system.analyzeResonance(history);

        return results;

    } catch (error) {
        console.error('Failed to analyze vortex resonance:', error);
        throw new Error('Falha na análise Vortex');
    }
}
