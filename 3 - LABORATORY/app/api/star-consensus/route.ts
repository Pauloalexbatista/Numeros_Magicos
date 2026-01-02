import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const systemsParam = searchParams.get('systems');
        const method = searchParams.get('method') || 'weighted';
        const backtestSize = parseInt(searchParams.get('backtest') || '100');

        if (!systemsParam) {
            return NextResponse.json({
                success: false,
                error: 'No systems selected'
            }, { status: 400 });
        }

        const selectedSystems = systemsParam.split(',');

        if (selectedSystems.length < 2) {
            return NextResponse.json({
                success: false,
                error: 'Select at least 2 systems'
            }, { status: 400 });
        }

        // Get system stats for weighting
        const systemStats = await prisma.starSystemRanking.findMany({
            where: { systemName: { in: selectedSystems } },
        });

        const systemWeights = new Map<string, number>();
        systemStats.forEach(s => {
            systemWeights.set(s.systemName, method === 'weighted' ? s.avgAccuracy : 1);
        });

        // Get draws for backtest
        const draws = await prisma.draw.findMany({
            orderBy: { id: 'desc' },
            take: backtestSize,
        });

        // Calculate consensus
        const starVotes = new Map<number, number>();

        // CRITICAL: Initialize ALL 12 stars with 0 votes
        // This ensures BOTTOM 6 includes stars with 0 votes (never predicted)
        for (let star = 1; star <= 12; star++) {
            starVotes.set(star, 0);
        }

        for (const system of selectedSystems) {
            const weight = systemWeights.get(system) || 1;

            for (const draw of draws) {
                const perf = await prisma.starSystemPerformance.findFirst({
                    where: { drawId: draw.id, systemName: system },
                });

                if (perf) {
                    const predicted = JSON.parse(perf.predictedStars);
                    predicted.forEach((star: number) => {
                        starVotes.set(star, (starVotes.get(star) || 0) + weight);
                    });
                }
            }
        }

        // Get top 6 stars (consensus)
        const sortedStars = Array.from(starVotes.entries())
            .sort((a, b) => b[1] - a[1]);

        const consensusStars = sortedStars.slice(0, 6).map(([star]) => star);
        const antiConsensusStars = sortedStars.slice(-6).map(([star]) => star);

        // Backtest consensus
        // CORRECT LOGIC: Count hits PER STAR (not per draw)
        // Universe: 12 stars total
        // Consensus: TOP 6 stars (most votes)
        // Anti-Consensus: BOTTOM 6 stars (least votes)
        // 
        // Each draw has 2 stars. Each star is counted individually:
        // - If star is in TOP 6 → +1 hit for Consensus
        // - If star is in BOTTOM 6 → +1 hit for Anti-Consensus
        //
        // Since each draw has exactly 2 stars, and each star is either in TOP or BOTTOM:
        // Consensus hits + Anti-Consensus hits = 2 * number of draws
        // Therefore: Consensus% + Anti-Consensus% = 100% ✅

        let consensusStarHits = 0;  // Count individual stars in TOP 6
        let antiStarHits = 0;        // Count individual stars in BOTTOM 6
        let totalStarsDrawn = 0;     // Total stars drawn (2 per draw)

        const hitDistribution: Record<number, number> = { 0: 0, 1: 0, 2: 0 };
        const antiHitDistribution: Record<number, number> = { 0: 0, 1: 0, 2: 0 };

        for (const draw of draws) {
            const actualStars = JSON.parse(draw.stars);
            totalStarsDrawn += actualStars.length; // Should be 2 per draw

            // Count how many of the 2 drawn stars are in consensus (TOP 6)
            const consensusMatches = actualStars.filter((s: number) => consensusStars.includes(s)).length;

            // Count how many are in anti-consensus (BOTTOM 6)
            const antiMatches = actualStars.filter((s: number) => antiConsensusStars.includes(s)).length;

            // Add to star hit counts (each star counts individually)
            consensusStarHits += consensusMatches;  // 0, 1, or 2
            antiStarHits += antiMatches;            // 0, 1, or 2

            // Track distribution for analysis
            hitDistribution[consensusMatches] = (hitDistribution[consensusMatches] || 0) + 1;
            antiHitDistribution[antiMatches] = (antiHitDistribution[antiMatches] || 0) + 1;
        }

        // Calculate accuracy as percentage of STARS hit (not draws)
        const consensusAccuracy = parseFloat(((consensusStarHits / totalStarsDrawn) * 100).toFixed(2));
        const antiAccuracy = parseFloat(((antiStarHits / totalStarsDrawn) * 100).toFixed(2));

        // Find best solo system
        const bestSolo = systemStats.reduce((best, current) =>
            current.avgAccuracy > best.avgAccuracy ? current : best
        );

        const improvement = parseFloat((consensusAccuracy - bestSolo.avgAccuracy).toFixed(2));

        return NextResponse.json({
            success: true,
            consensus: {
                stars: consensusStars,
                votingDetails: sortedStars.slice(0, 12).map(([star, votes]) => ({
                    star,
                    votes: Math.round(votes),
                    weightedVotes: votes,
                })),
                method,
            },
            antiConsensus: {
                stars: antiConsensusStars,
                votingDetails: sortedStars.slice(-12).map(([star, votes]) => ({
                    star,
                    votes: Math.round(votes),
                    weightedVotes: votes,
                })),
            },
            backtest: {
                drawsAnalyzed: draws.length,
                consensus: {
                    accuracyRate: consensusAccuracy,
                    avgHits: parseFloat((consensusStarHits / draws.length).toFixed(2)),
                    hitDistribution,
                },
                antiConsensus: {
                    accuracyRate: antiAccuracy,
                    avgHits: parseFloat((antiStarHits / draws.length).toFixed(2)),
                    hitDistribution: antiHitDistribution,
                },
                validation: {
                    totalPercentage: parseFloat((consensusAccuracy + antiAccuracy).toFixed(2)),
                    isValid: Math.abs((consensusAccuracy + antiAccuracy) - 100) < 0.01,
                    totalStarsDrawn,
                    consensusStarHits,
                    antiStarHits,
                },
            },
            comparison: {
                bestSolo: {
                    name: bestSolo.systemName,
                    accuracy: parseFloat(bestSolo.avgAccuracy.toFixed(2)),
                },
                consensusImprovement: improvement,
                antiImprovement: parseFloat((antiAccuracy - bestSolo.avgAccuracy).toFixed(2)),
                allSystems: systemStats.map(s => ({
                    name: s.systemName,
                    accuracy: parseFloat(s.avgAccuracy.toFixed(2)),
                    count: draws.length,
                })),
            },
            systems: selectedSystems.map(name => ({
                name,
                weight: systemWeights.get(name) || 1,
            })),
        });

    } catch (error: any) {
        console.error('[Star Consensus Error]:', error);
        return NextResponse.json({
            success: false,
            error: error.message,
            details: error.stack,
        }, { status: 500 });
    }
}
