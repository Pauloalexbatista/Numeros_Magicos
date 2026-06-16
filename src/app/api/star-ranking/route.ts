import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const game = req.nextUrl.searchParams.get('game')?.toUpperCase() || 'EUROMILLIONS';
    try {
        const { getStarRankingMetrics } = await import('@/app/analysis/stars/actions');
        const ranking = await getStarRankingMetrics(game);
        return NextResponse.json({ game, ranking });
    } catch (error) {
        console.error('Error fetching star ranking:', error);
        return NextResponse.json({ error: 'Failed to fetch star ranking' }, { status: 500 });
    }
}
