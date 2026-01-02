import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        // Get top star systems
        const systems = await prisma.starSystemRanking.findMany({
            orderBy: { avgAccuracy: 'desc' },
            take: 10,
        });

        const systemNames = systems.map(s => s.systemName);

        // Get recent draws for analysis
        const draws = await prisma.draw.findMany({
            orderBy: { id: 'desc' },
            take: 100,
        });

        // Analyze PAIRS
        const pairResults: any[] = [];

        for (let i = 0; i < systemNames.length; i++) {
            for (let j = i + 1; j < systemNames.length; j++) {
                const sys1 = systemNames[i];
                const sys2 = systemNames[j];

                let combinedJackpots = 0;
                let sys1Jackpots = 0;
                let sys2Jackpots = 0;

                for (const draw of draws) {
                    const actualStars = JSON.parse(draw.stars);

                    const perf1 = await prisma.starSystemPerformance.findFirst({
                        where: { drawId: draw.id, systemName: sys1 },
                    });
                    const perf2 = await prisma.starSystemPerformance.findFirst({
                        where: { drawId: draw.id, systemName: sys2 },
                    });

                    if (perf1 && perf2) {
                        const pred1 = JSON.parse(perf1.predictedStars);
                        const pred2 = JSON.parse(perf2.predictedStars);

                        const hits1 = actualStars.filter((s: number) => pred1.includes(s)).length;
                        const hits2 = actualStars.filter((s: number) => pred2.includes(s)).length;

                        if (hits1 === 2) sys1Jackpots++;
                        if (hits2 === 2) sys2Jackpots++;
                        if (hits1 === 2 || hits2 === 2) combinedJackpots++;
                    }
                }

                const coverage = parseFloat(((combinedJackpots / draws.length) * 100).toFixed(1));
                const complementarity = combinedJackpots - Math.max(sys1Jackpots, sys2Jackpots);

                pairResults.push({
                    systems: [sys1, sys2],
                    combinedJackpots,
                    coverage,
                    complementarity,
                    sys1Jackpots,
                    sys2Jackpots,
                });
            }
        }

        pairResults.sort((a, b) => b.combinedJackpots - a.combinedJackpots);

        // Analyze TRIOS (top 5 systems only for performance)
        const trioResults: any[] = [];
        const topSystems = systemNames.slice(0, 5);

        for (let i = 0; i < topSystems.length; i++) {
            for (let j = i + 1; j < topSystems.length; j++) {
                for (let k = j + 1; k < topSystems.length; k++) {
                    const sys1 = topSystems[i];
                    const sys2 = topSystems[j];
                    const sys3 = topSystems[k];

                    let combinedJackpots = 0;

                    for (const draw of draws) {
                        const actualStars = JSON.parse(draw.stars);

                        const perfs = await Promise.all([
                            prisma.starSystemPerformance.findFirst({
                                where: { drawId: draw.id, systemName: sys1 },
                            }),
                            prisma.starSystemPerformance.findFirst({
                                where: { drawId: draw.id, systemName: sys2 },
                            }),
                            prisma.starSystemPerformance.findFirst({
                                where: { drawId: draw.id, systemName: sys3 },
                            }),
                        ]);

                        if (perfs.every(p => p)) {
                            const predictions = perfs.map(p => JSON.parse(p!.predictedStars));
                            const hasJackpot = predictions.some(pred =>
                                actualStars.filter((s: number) => pred.includes(s)).length === 2
                            );

                            if (hasJackpot) combinedJackpots++;
                        }
                    }

                    const coverage = parseFloat(((combinedJackpots / draws.length) * 100).toFixed(1));

                    trioResults.push({
                        systems: [sys1, sys2, sys3],
                        combinedJackpots,
                        coverage,
                        complementarity: 0, // Simplified for trios
                    });
                }
            }
        }

        trioResults.sort((a, b) => b.combinedJackpots - a.combinedJackpots);

        return NextResponse.json({
            success: true,
            pairs: pairResults.slice(0, 10),
            trios: trioResults.slice(0, 10),
            summary: {
                totalSystems: systemNames.length,
                drawsAnalyzed: draws.length,
                pairsAnalyzed: pairResults.length,
                triosAnalyzed: trioResults.length,
            },
        });

    } catch (error: any) {
        console.error('[Star Complementarity Error]:', error);
        return NextResponse.json({
            success: false,
            error: error.message,
            details: error.stack,
        }, { status: 500 });
    }
}
