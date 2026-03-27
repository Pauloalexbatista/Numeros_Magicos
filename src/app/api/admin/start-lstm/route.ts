import { NextResponse } from 'next/server';
import { runTitanLSTM } from '../../../../scripts/titan-lstm';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        
        if (body.secret !== 'magia2026') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const cacheRaw = await prisma.statisticsCache.findUnique({
             where: { key: 'LSTM_PROGRESS' }
        });
        
        if (cacheRaw && cacheRaw.data) {
             const data = (typeof cacheRaw.data === "string" ? JSON.parse(cacheRaw.data) : cacheRaw.data);
             if (data.isRunning === true) {
                 return NextResponse.json({ success: false, error: 'O Motor LSTM já se encontra ativo noutra instância.' }, { status: 400 });
             }
        }

        runTitanLSTM().then(() => console.log('LSTM Engine finished.')).catch(console.error);

        return NextResponse.json({
            success: true,
            message: 'Motor LSTM arrancou! Pode acompanhar o progresso hiper-detalhado (por sorteio) em tempo real.',
        });

    } catch (error: any) {
        console.error('Trigger LSTM error:', error);
        return NextResponse.json(
            { success: false, error: 'Falha ao arrancar motor LSTM.' },
            { status: 500 }
        );
    }
}
