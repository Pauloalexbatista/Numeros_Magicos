import { NextResponse } from 'next/server';
import { getHistory } from '@/app/actions';
import { calculateFrequency, calculateStreaks } from '@/services/patternDetection';

export async function GET(request: Request) {
    const url = new URL(request.url);
    const type = url.searchParams.get('type') ?? 'frequency'; // 'frequency' | 'streaks'
    const limitParam = url.searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;

    const history = await getHistory();

    if (type === 'streaks') {
        const streaks = calculateStreaks(history);
        return NextResponse.json({ type: 'streaks', data: streaks, drawsUsed: history.length });
    }

    // default to frequency
    const freq = calculateFrequency(history, limit);
    return NextResponse.json({ type: 'frequency', data: freq, drawsUsed: limit ?? history.length });
}
