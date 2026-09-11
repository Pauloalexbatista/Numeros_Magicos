import { prisma } from "@/lib/prisma";

export async function getRanking(game: string = "EUROMILLIONS") {
    const systems = await prisma.rankedSystem.findMany({
        where: { isActive: true, game },
    });

    const ranking: any[] = [];
    for (const sys of systems) {
        // Fetch last 100 predictions for this system in NUMBERS domain
        const preds = await prisma.systemPrediction.findMany({
            where: { systemName: sys.name, game, domain: "NUMBERS" },
            orderBy: { drawId: "desc" },
            take: 100
        });

        if (preds.length === 0) continue;

        let totalHits = 0;
        for (const p of preds) {
            totalHits += p.num_hits_25 || 0;
        }
        
        const avgHits = totalHits / preds.length;
        const avgAccuracy = (avgHits / 5) * 100;
        
        ranking.push({
            id: sys.id,
            systemName: sys.name,
            game: sys.game,
            system: sys,
            avgAccuracy,
            totalPredictions: preds.length,
            concept: sys.concept,
            logic: sys.logic
        });
    }

    return ranking.sort((a, b) => b.avgAccuracy - a.avgAccuracy);
}

export async function getSystemPerformance(systemName: string, limit: number = 100, game?: string) {
    const where: any = { systemName, domain: "NUMBERS" };
    if (game) {
        where.game = game.toUpperCase();
    }
    const preds = await prisma.systemPrediction.findMany({
        where,
        include: { draw: true },
        orderBy: { drawId: "desc" },
        take: limit
    });
    
    return preds.map(p => {
         const predArr = typeof p.prediction === "string" ? JSON.parse(p.prediction) : p.prediction;
         const top25 = predArr.slice(0, 25);
         const actualArr = typeof p.draw.numbers === "string" ? JSON.parse(p.draw.numbers) : p.draw.numbers;
         const hits = p.num_hits_25 || 0;
         const accuracy = (hits / 5) * 100;
         return {
             id: p.id,
             drawId: p.drawId,
             game: p.game,
             systemName: p.systemName,
             predictedNumbers: JSON.stringify(top25),
             actualNumbers: typeof p.draw.numbers === "string" ? p.draw.numbers : JSON.stringify(p.draw.numbers),
             hits,
             accuracy,
             createdAt: p.calculatedAt,
             draw: p.draw
         };
    });
}

export function calculateRandomBaseline(): number {
    return 20.0;
}

