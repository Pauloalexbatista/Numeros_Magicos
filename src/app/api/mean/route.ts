import { NextResponse } from 'next/server';
import { getHistory } from '@/app/actions';
import { calculateMean } from '@/services/statistics';

export async function GET(request: Request) {
    const url = new URL(request.url);
    const limitParam = url.searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;
    const game = url.searchParams.get('game') || undefined;

    const history = await getHistory(game);

    // Parse JSON strings to arrays for the service
    const parsedHistory = history.map(d => ({
        ...d,
        numbers: typeof d.numbers === 'string' ? (typeof d.numbers === "string" ? JSON.parse(d.numbers) : d.numbers) : d.numbers,
        stars: typeof d.stars === 'string' ? (typeof d.stars === "string" ? JSON.parse(d.stars) : d.stars) : d.stars
    }));

    const { meanNumbers, meanStars } = calculateMean(parsedHistory as any[], limit);

    return NextResponse.json({ meanNumbers, meanStars, drawsUsed: limit ?? history.length });
}
