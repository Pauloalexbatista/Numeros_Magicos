/**
 * Helper function to determine prediction count and max number based on game type
 * This should be imported by all systems in src/services/
 */

import { Draw } from '@prisma/client';

export function getGameConfig(history: Draw[]): { predCount: number; maxNum: number } {
    const game = history[0]?.game;

    if (game === 'EURODREAMS') {
        return { predCount: 18, maxNum: 40 }; // 6 × 3 = 18
    } else if (game === 'TOTOLOTO') {
        return { predCount: 15, maxNum: 49 }; // 5 × 3 = 15
    } else {
        return { predCount: 15, maxNum: 50 }; // EUROMILLIONS: 5 × 3 = 15
    }
}
