import { NextResponse } from 'next/server';
import { getSystemPerformance } from '@/services/ranking-evaluator';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ system: string }> }
) {
    try {
        const { system } = await params;
        const systemName = decodeURIComponent(system);
        const url = new URL(request.url);
        const limit = parseInt(url.searchParams.get('limit') || '100');

        const performances = await getSystemPerformance(systemName, limit);

        return NextResponse.json({
            systemName,
            performances,
            total: performances.length
        });
    } catch (error) {
        console.error('Error fetching system performance:', error);
        return NextResponse.json(
            { error: 'Failed to fetch system performance' },
            { status: 500 }
        );
    }
}
