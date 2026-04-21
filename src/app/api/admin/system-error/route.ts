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
             where: { key: 'SYSTEM_ERROR' }
        });
        
        if (cacheRaw && cacheRaw.data) {
             return NextResponse.json({ 
                 error: true, 
                 data: (typeof cacheRaw.data === "string" ? JSON.parse(cacheRaw.data) : cacheRaw.data) 
             });
        }

        return NextResponse.json({ error: false });

    } catch (error: any) {
        return NextResponse.json({ error: false }); // Silently ignore read errors
    }
}
