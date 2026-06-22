import { prisma } from '@/lib/prisma';
import { getGameConfig } from '@/services/game-config';
import { Prisma } from '@prisma/client';

export async function fetchSystemPerformances(args: Prisma.SystemPerformanceFullPoolFindManyArgs) {
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

        return {
            ...p,
            hits,
            accuracy,
            predictedNumbers: JSON.stringify(pred)
        };
    });
}
