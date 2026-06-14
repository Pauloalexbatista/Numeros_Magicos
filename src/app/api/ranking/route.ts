
import { NextRequest, NextResponse } from 'next/server';
import { getRanking, calculateRandomBaseline, getSystemPerformance } from '@/services/ranking-evaluator';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const game = req.nextUrl.searchParams.get('game') || undefined;
        const ranking = await getRanking(game);

        // Attach recent performance (last 10) to each system
        const rankingWithHistory = await Promise.all(ranking.map(async (item: any) => {
            const history = await getSystemPerformance(item.systemName, 10);
            return {
                ...item,
                recentPerformance: history
            };
        }));

        // Add random baseline for comparison
        const randomBaseline = {
            systemName: 'Random Selection',
            avgAccuracy: calculateRandomBaseline(),
            totalPredictions: 0,
            system: {
                name: 'Random Selection',
                description: 'Escolha aleatória (baseline)',
                isActive: false
            }
        };

        return NextResponse.json({
            game,
            ranking: rankingWithHistory,
            baseline: randomBaseline
        });
    } catch (error) {
        console.error('Error fetching ranking:', error);
        return NextResponse.json(
            { error: 'Failed to fetch ranking' },
            { status: 500 }
        );
    }
}
