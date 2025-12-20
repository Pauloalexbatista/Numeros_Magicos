import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const systemNames = searchParams.get('systems')?.split(',') || [];
        const method = searchParams.get('method') || 'weighted';
        const backtestSize = parseInt(searchParams.get('backtest') || '100');

        console.log('[Consensus] Request:', { systemNames, method, backtestSize });

        if (systemNames.length < 2) {
            return NextResponse.json({
                success: false,
                error: 'Selecione pelo menos 2 sistemas'
            }, { status: 400 });
        }

        // 1. Get historical draws
        const historicalDraws = await prisma.draw.findMany({
            orderBy: { id: 'desc' },
            take: backtestSize,
            select: {
                id: true,
                numbers: true
            }
        });

        // 2. Get system weights
        const performances = await prisma.systemPerformance.findMany({
            where: { systemName: { in: systemNames } },
            select: { systemName: true, accuracy: true },
            orderBy: { drawId: 'desc' },
            take: systemNames.length * 100
        });

        const weights = new Map<string, number>();
        systemNames.forEach(name => {
            const systemPerfs = performances.filter(p => p.systemName === name);
            const avgAccuracy = systemPerfs.length > 0
                ? systemPerfs.reduce((sum, p) => sum + p.accuracy, 0) / systemPerfs.length
                : 0.5;
            weights.set(name, avgAccuracy);
        });

        // 3. BACKTEST: Process each draw (predict NEXT draw)
        let consensusTotalHits = 0;
        let antiTotalHits = 0;
        const consensusHitDist = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        const antiHitDist = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        let validDraws = 0;

        // Process all EXCEPT last draw (need next draw to test against)
        for (let i = 0; i < historicalDraws.length - 1; i++) {
            const currentDraw = historicalDraws[i];
            const nextDraw = historicalDraws[i + 1];

            // Get predictions FOR NEXT DRAW (Targeting nextDraw)
            const drawPredictions = await prisma.systemPrediction.findMany({
                where: {
                    drawId: nextDraw.id, // Corrected: Fetch prediction targetting the RESULT draw
                    systemName: { in: systemNames }
                },
                select: {
                    systemName: true,
                    prediction: true
                }
            });

            if (drawPredictions.length < systemNames.length) continue;

            // Calculate consensus
            const votes = new Map<number, { simple: number; weighted: number }>();
            for (let num = 1; num <= 50; num++) {
                votes.set(num, { simple: 0, weighted: 0 });
            }

            drawPredictions.forEach(pred => {
                const numbers = pred.prediction.split(',')
                    .map(n => parseInt(n.trim()))
                    .filter(n => !isNaN(n) && n >= 1 && n <= 50);

                const weight = weights.get(pred.systemName) || 0.5;

                numbers.forEach(num => {
                    const current = votes.get(num);
                    if (current) {
                        current.simple += 1;
                        current.weighted += weight;
                    }
                });
            });

            // Select TOP 25 and BOTTOM 25
            const allSorted = Array.from(votes.entries())
                .map(([number, counts]) => ({
                    number,
                    votes: counts.simple,
                    weightedVotes: counts.weighted
                }))
                .sort((a, b) => {
                    return method === 'weighted'
                        ? b.weightedVotes - a.weightedVotes
                        : b.votes - a.votes;
                });

            const drawConsensus = allSorted.slice(0, 25).map(v => v.number);
            const drawAnti = allSorted.slice(-25).map(v => v.number);

            // Test against NEXT draw (what we predicted)
            const nextDrawNumbers = nextDraw.numbers
                .replace(/[\[\]]/g, '')
                .split(',')
                .map(n => parseInt(n.trim()))
                .filter(n => !isNaN(n));

            const cHits = drawConsensus.filter(n => nextDrawNumbers.includes(n)).length;
            consensusTotalHits += cHits;
            consensusHitDist[cHits as keyof typeof consensusHitDist]++;

            const aHits = drawAnti.filter(n => nextDrawNumbers.includes(n)).length;
            antiTotalHits += aHits;
            antiHitDist[aHits as keyof typeof antiHitDist]++;

            validDraws++;
        }

        const consensusAvgHits = consensusTotalHits / validDraws;
        const consensusAccuracy = (consensusAvgHits / 5) * 100;

        const antiAvgHits = antiTotalHits / validDraws;
        const antiAccuracy = (antiAvgHits / 5) * 100;

        // 4. Get LATEST predictions for display
        // We need the latest draw ID to fetch the most recent predictions
        const latestDraw = historicalDraws[historicalDraws.length - 1];

        let latestPredictions;
        try {
            latestPredictions = await prisma.systemPrediction.findMany({
                where: {
                    systemName: { in: systemNames },
                    // Ensure we only get the absolute latest prediction for each system
                    drawId: latestDraw.id
                },
                select: {
                    systemName: true,
                    prediction: true
                }
            });
        } catch (err: any) {
            console.error('[Consensus Error] Failed to fetch latest predictions:', err);
            return NextResponse.json({
                error: 'Erro ao buscar previsões recentes',
                details: err.message
            }, { status: 500 });
        }

        // Calculate consensus for NEXT draw
        const nextVotes = new Map<number, { simple: number; weighted: number }>();
        for (let num = 1; num <= 50; num++) {
            nextVotes.set(num, { simple: 0, weighted: 0 });
        }

        latestPredictions.forEach(pred => {
            const numbers = pred.prediction.split(',')
                .map(n => parseInt(n.trim()))
                .filter(n => !isNaN(n) && n >= 1 && n <= 50);

            const weight = weights.get(pred.systemName) || 0.5;

            numbers.forEach(num => {
                const current = nextVotes.get(num);
                if (current) {
                    current.simple += 1;
                    current.weighted += weight;
                }
            });
        });

        const nextSorted = Array.from(nextVotes.entries())
            .map(([number, counts]) => ({
                number,
                votes: counts.simple,
                weightedVotes: counts.weighted
            }))
            .sort((a, b) => {
                return method === 'weighted'
                    ? b.weightedVotes - a.weightedVotes
                    : b.votes - a.votes;
            });

        const top25 = nextSorted.slice(0, 25);
        const bottom25 = nextSorted.slice(-25);

        // 5. Get best individual system
        const bestSystemPerf = await prisma.systemPerformance.findMany({
            where: { systemName: { in: systemNames } },
            orderBy: { drawId: 'desc' },
            take: systemNames.length * backtestSize,
            select: {
                systemName: true,
                accuracy: true
            }
        });

        const systemAccuracies = new Map<string, number[]>();
        bestSystemPerf.forEach(perf => {
            if (!systemAccuracies.has(perf.systemName)) {
                systemAccuracies.set(perf.systemName, []);
            }
            systemAccuracies.get(perf.systemName)!.push(perf.accuracy);
        });

        let bestSoloName = '';
        let bestSoloAccuracy = 0;
        systemAccuracies.forEach((accuracies, name) => {
            const avgAccuracy = accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length;
            if (avgAccuracy > bestSoloAccuracy) {
                bestSoloAccuracy = avgAccuracy;
                bestSoloName = name;
            }
        });

        const individualPerformances = systemNames.map(sysName => {
            const sysPerformances = bestSystemPerf.filter(p => p.systemName === sysName);
            const avgAcc = sysPerformances.length > 0
                ? sysPerformances.reduce((sum, p) => sum + p.accuracy, 0) / sysPerformances.length
                : 0;
            return {
                name: sysName,
                accuracy: Math.round(avgAcc * 10) / 10,
                count: sysPerformances.length
            };
        }).sort((a, b) => b.accuracy - a.accuracy);

        return NextResponse.json({
            success: true,
            consensus: {
                numbers: top25.map(v => v.number),
                votingDetails: top25,
                method
            },
            antiConsensus: {
                numbers: bottom25.map(v => v.number),
                votingDetails: bottom25
            },
            backtest: {
                drawsAnalyzed: validDraws,
                consensus: {
                    accuracyRate: Math.round(consensusAccuracy * 10) / 10,
                    avgHits: Math.round(consensusAvgHits * 100) / 100,
                    hitDistribution: consensusHitDist
                },
                antiConsensus: {
                    accuracyRate: Math.round(antiAccuracy * 10) / 10,
                    avgHits: Math.round(antiAvgHits * 100) / 100,
                    hitDistribution: antiHitDist
                }
            },
            comparison: {
                bestSolo: {
                    name: bestSoloName,
                    accuracy: Math.round(bestSoloAccuracy * 10) / 10
                },
                consensusImprovement: Math.round((consensusAccuracy - bestSoloAccuracy) * 10) / 10,
                antiImprovement: Math.round((antiAccuracy - bestSoloAccuracy) * 10) / 10,
                allSystems: individualPerformances
            },
            systems: systemNames.map(name => ({
                name,
                weight: Math.round((weights.get(name) || 0) * 100)
            }))
        });

    } catch (error: any) {
        console.error('[Consensus API Error]:', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'Erro desconhecido',
            details: error.stack
        }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}
