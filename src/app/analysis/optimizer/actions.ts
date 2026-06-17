'use server';

import { getActiveSystemsForGame, getSystemHistoricalPerformance } from '@/app/analysis/actions';

export async function getSystemsAction(game: string) {
    return await getActiveSystemsForGame(game);
}

export async function getPerformanceAction(systemName: string, game: string) {
    return await getSystemHistoricalPerformance(systemName, game);
}