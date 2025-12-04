import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSystemByName } from '@/services/ranked-systems';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const systemName = searchParams.get('system');

        if (!systemName) {
            return NextResponse.json({ error: 'System name required' }, { status: 400 });
        }

        // Try to get cached prediction
        const cached = await prisma.cachedPrediction.findUnique({
            where: { systemName },
            include: { system: true }
        });

        if (cached) {
            return NextResponse.json({
                numbers: JSON.parse(cached.numbers),
                worstNumbers: cached.worstNumbers ? JSON.parse(cached.worstNumbers) : [],
                lastUpdated: cached.updatedAt,
                source: 'cache'
            });
        }

        // If not cached, we could calculate it on the fly, but for now let's return empty or error
        // The user wants speed, so we should rely on cache.
        // But if it's the first run, maybe trigger calculation?
        // For safety, let's return null and let client handle it (or show "Needs Update")

        return NextResponse.json({
            numbers: [],
            worstNumbers: [],
            source: 'empty'
        });

    } catch (error) {
        console.error('Error fetching prediction:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
