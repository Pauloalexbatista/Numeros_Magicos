import { NextResponse } from 'next/server';
import { getHistory } from '@/app/actions';
import { calculateFrequency, calculateStreaks } from '@/services/patternDetection';

export async function GET(request: Request) {
    const url = new URL(request.url);
    const type = url.searchParams.get('type') ?? 'frequency'; // 'frequency' | 'streaks'
    const limitParam = url.searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;

    const history = await getHistory();

    // Parse JSON strings to arrays for the service
    const parsedHistory = history.map(d => ({
        ...d,
        numbers: typeof d.numbers === 'string' ? JSON.parse(d.numbers) : d.numbers,
        stars: typeof d.stars === 'string' ? JSON.parse(d.stars) : d.stars
    }));

    if (type === 'streaks') {
        const streaks = calculateStreaks(parsedHistory as any[]);
        return NextResponse.json({ type: 'streaks', data: streaks, drawsUsed: history.length });
    }

    // default to frequency
    const freq = calculateFrequency(parsedHistory as any[], limit);
    return NextResponse.json({ type: 'frequency', data: freq, drawsUsed: limit ?? history.length });
}
