/**
 * Helper function to determine prediction count and max number based on game type
 * This should be imported by all systems in src/services/
 */

import { Draw } from '@prisma/client';

export function getGameConfig(history: Draw[]): { predCount: number; maxNum: number } {
    const game = history[0]?.game;
    let maxNum = 50;

    if (game === 'EURODREAMS') {
        maxNum = 40;
    } else if (game === 'TOTOLOTO') {
        maxNum = 49;
    } else if (game === 'MEGASENA') {
        maxNum = 60;
    }

    // Allow scripts to request FULL ranking (all numbers)
    if (process.env.FULL_RANKING_MODE === 'true') {
        return { predCount: maxNum, maxNum };
    }

    // Default prediction counts per game
    if (game === 'EURODREAMS') {
        return { predCount: 20, maxNum: 40 };
    } else if (game === 'TOTOLOTO') {
        return { predCount: 25, maxNum: 49 };
    } else if (game === 'MEGASENA') {
        return { predCount: 30, maxNum: 60 };
    } else {
        return { predCount: 25, maxNum: 50 };
    }
}
