import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        if (searchParams.get('secret') !== 'magia2026') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const progress = await prisma.statisticsCache.findUnique({
            where: { key: 'TITAN_PROGRESS' }
        });

        if (!progress) return NextResponse.json({ isRunning: false });

        return NextResponse.json(JSON.parse(progress.data));
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
