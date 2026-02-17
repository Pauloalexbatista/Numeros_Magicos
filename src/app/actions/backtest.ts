'use server';

import { BacktestResult } from '@/lib/types';

export async function runBacktestAction(modelId: string, testDraws: number, predictionSize: number): Promise<BacktestResult> {
    console.warn('Backtest functionality is currently disabled.');
    return {
        hitRate: 0,
        hits: 0,
        totalDraws: testDraws,
        roi: 0,
        distribution: {},
        expectedDistribution: {},
        details: []
    };
}
