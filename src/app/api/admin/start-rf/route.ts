import { NextResponse } from 'next/server';
import { runTitanRF } from '../../../../scripts/titan-rf';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        
        if (body.secret !== 'magia2026') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if RF Engine is already running
        const cacheRaw = await prisma.statisticsCache.findUnique({
             where: { key: 'RF_PROGRESS' }
        });
        
        if (cacheRaw && cacheRaw.data) {
             const data = (typeof cacheRaw.data === "string" ? JSON.parse(cacheRaw.data) : cacheRaw.data);
             // Safety override if stuck: allow if pct is NaN or past is running dead
             if (data.isRunning === true) {
                 return NextResponse.json({ success: false, error: 'O Motor RF já se encontra em Execução.' }, { status: 400 });
             }
        }

        // We run it asynchronously so we don't block the request wrapper
        // Vercel / Next.js limits serverless functions but this starts the local script background in theory
        runTitanRF().then(() => console.log('Random Forest Engine finished.')).catch(console.error);

        return NextResponse.json({
            success: true,
            message: 'Motor Random Forest arrancou! Pode acompanhar o progresso em tempo real.',
        });

    } catch (error: any) {
        console.error('Trigger RF Engine error:', error);
        return NextResponse.json(
            { success: false, error: 'Falha ao arrancar motor RF.' },
            { status: 500 }
        );
    }
}
