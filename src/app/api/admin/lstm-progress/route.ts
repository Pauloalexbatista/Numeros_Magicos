import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        if (searchParams.get('secret') !== 'magia2026') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const cacheRaw = await prisma.statisticsCache.findUnique({
             where: { key: 'LSTM_PROGRESS' }
        });
        
        if (cacheRaw && cacheRaw.data) {
             return NextResponse.json((typeof cacheRaw.data === "string" ? JSON.parse(cacheRaw.data) : cacheRaw.data));
        }

        return NextResponse.json({ isRunning: false });

    } catch (error: any) {
        return NextResponse.json(
            { error: 'Falha ao ler progresso LSTM.' },
            { status: 500 }
        );
    }
}
