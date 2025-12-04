import { NextResponse } from 'next/server';
import { getHistory } from '@/app/actions';
import { calculateMean } from '@/services/statistics';

export async function GET(request: Request) {
    const url = new URL(request.url);
    const limitParam = url.searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;

    const history = await getHistory();
    const { meanNumbers, meanStars } = calculateMean(history, limit);

    return NextResponse.json({ meanNumbers, meanStars, drawsUsed: limit ?? history.length });
}
