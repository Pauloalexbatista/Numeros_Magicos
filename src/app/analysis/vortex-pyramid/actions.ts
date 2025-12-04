'use server';

import { prisma } from '@/lib/prisma';
import { VortexPyramidSystem } from '@/services/vortex-pyramid';

export interface VortexResonance {
    num: number;
    score: number;
}

export async function getVortexAnalysis(): Promise<VortexResonance[]> {
    try {
        // 1. Fetch history
        const history = await prisma.draw.findMany({
            orderBy: { date: 'asc' },
            take: 300 // Need significant history for Time-Vortex
        });

        if (history.length === 0) return [];

        // 2. Run Analysis
        const system = new VortexPyramidSystem();
        const results = system.analyzeResonance(history);

        return results;

    } catch (error) {
        console.error('Failed to analyze vortex resonance:', error);
        throw new Error('Falha na análise Vortex');
    }
}
