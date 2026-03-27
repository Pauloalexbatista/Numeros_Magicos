
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const secret = searchParams.get('secret');

        if (secret !== 'magia2026') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { action } = await request.json();

        if (action === 'STOP') {
            // Write the stop signal to DB
            await prisma.statisticsCache.upsert({
                where: { key: 'NEURAL_STOP_SIGNAL' },
                update: { data: 'STOP', updatedAt: new Date() },
                create: { key: 'NEURAL_STOP_SIGNAL', data: 'STOP' }
            });

            console.log('🛑 [API] STOP SIGNAL SENT TO NEURAL ENGINES');

            return NextResponse.json({
                success: true,
                message: 'Sinal de paragem enviado. Os motores devem desligar-se nos próximos segundos.'
            });
        }

        if (action === 'RESET') {
            // Clear the stop signal to allow future starts
            await prisma.statisticsCache.delete({
                where: { key: 'NEURAL_STOP_SIGNAL' }
            }).catch(() => {});

            // FORCE CLEAR ALL PROGRESS FLAGS to 'isRunning: false'
            // This is for when the process was killed (e.g. Redeploy/Restart) but the DB flag persisted
            const keys = ['LSTM_PROGRESS', 'TITAN_PROGRESS', 'RF_PROGRESS'];
            for (const key of keys) {
                const cache = await prisma.statisticsCache.findUnique({ where: { key } });
                if (cache && cache.data) {
                    const data = (typeof cache.data === "string" ? JSON.parse(cache.data) : cache.data);
                    data.isRunning = false;
                    data.message = 'Limpo manualmente após reinício.';
                    await prisma.statisticsCache.update({
                        where: { key },
                        data: { data: JSON.stringify(data) }
                    });
                }
            }

            return NextResponse.json({
                success: true,
                message: 'Bloqueios de status limpos. Já pode arrancar os motores novamente.'
            });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error: any) {
        console.error('Error in Neural Stop API:', error);
        return NextResponse.json(
            { error: 'Internal Server Error', details: error.message },
            { status: 500 }
        );
    }
}
