import { prisma } from '@/lib/prisma';
import { getGameConfig } from '@/services/game-config';
import { Prisma } from '@prisma/client';

export async function fetchSystemPerformances<T extends Prisma.SystemPerformanceFullPoolFindManyArgs>(args: T) {
    const records = await prisma.systemPerformanceFullPool.findMany(args);

    return records.map(p => {
        const config = getGameConfig([{ game: p.game } as any]);
        const predCount = config.predCount;

        const pred = JSON.parse(p.predictedNumbers).slice(0, predCount);
        const actual = typeof p.actualNumbers === 'string' ? JSON.parse(p.actualNumbers) : p.actualNumbers;
        
        let hits = 0;
        if (Array.isArray(actual)) {
            hits = actual.filter((n: number) => pred.includes(n)).length;
        }

        const accuracy = Array.isArray(actual) && actual.length > 0 ? (hits / actual.length) * 100 : 0;

        // Spread preserve nested properties (like draw, system, etc)
        return {
            ...p,
            hits,
            accuracy,
            predictedNumbers: JSON.stringify(pred)
        } as any; // Cast to bypass TS property constraint since we preserve dynamic relations
    });
}
