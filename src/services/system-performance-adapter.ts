import { prisma } from "@/lib/prisma";
import { getGameConfig } from "@/services/game-config";
import { Prisma } from "@prisma/client";

export async function fetchSystemPerformances<T extends Prisma.SystemPredictionFindManyArgs>(args: T) {
    // Merge domain: 'NUMBERS' into where clause, removing any relation-based domain filter
    const incomingWhere = (args as any).where || {};
    
    // Remove system relation filter if it contains domain (we handle domain directly)
    const { system: _systemRelation, ...restWhere } = incomingWhere;
    
    const argsWithDomain = {
        ...args,
        where: {
            ...restWhere,
            domain: 'NUMBERS'  // Force direct domain filter to avoid duplicates
        },
        // Always include draw relation so we can read numbers for hit calculation
        include: {
            ...(((args as any).include) || {}),
            draw: true
        }
    };

    const records = await prisma.systemPrediction.findMany(argsWithDomain as any);

    return records.map(p => {
        const config = getGameConfig([{ game: p.game } as any]);
        const predCount = config.predCount;

        // Get top predictions (sliced to predCount)
        let pred: number[] = [];
        try {
            pred = typeof p.prediction === "string" ? JSON.parse(p.prediction).slice(0, predCount) : [];
        } catch(e) {}

        // Get actual draw numbers
        let actual: number[] = [];
        try {
            const drawNumbers = (p as any).draw?.numbers;
            actual = typeof drawNumbers === "string" ? JSON.parse(drawNumbers) : (drawNumbers || []);
        } catch(e) {}
        
        // Match the correct pre-calculated DB column for this game's pool size
        let hits = 0;
        const hitKey = `num_hits_${predCount}`;
        
        if ((p as any)[hitKey] != null) {
            hits = (p as any)[hitKey];
        } else if (Array.isArray(pred) && Array.isArray(actual) && actual.length > 0) {
            // If the column is null, calculate live
            const topPred = pred.slice(0, predCount);
            hits = topPred.filter((n: number) => actual.includes(n)).length;
        }
        
        const accuracy = predCount > 0 ? (hits / predCount) * 100 : 0;

        return {
            ...p,
            id: p.id,
            drawId: p.drawId,
            game: p.game,
            systemName: p.systemName,
            createdAt: p.calculatedAt,
            hits,
            accuracy,
            predictedNumbers: JSON.stringify(pred),
            actualNumbers: JSON.stringify(actual)
        } as any; 
    });
}

