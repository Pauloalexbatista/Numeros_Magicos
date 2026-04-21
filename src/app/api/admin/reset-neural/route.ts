import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        if (searchParams.get('secret') !== 'magia2026') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 1. Clear Lock
        await prisma.statisticsCache.delete({ where: { key: 'NEURAL_TRAINING_LOCK' } }).catch(() => {});
        
        // 2. Clear System Errors
        await prisma.statisticsCache.delete({ where: { key: 'SYSTEM_ERROR' } }).catch(() => {});

        // 3. Reset all progress bars
        await prisma.statisticsCache.delete({ where: { key: 'RF_PROGRESS' } }).catch(() => {});
        await prisma.statisticsCache.delete({ where: { key: 'LSTM_PROGRESS' } }).catch(() => {});
        await prisma.statisticsCache.delete({ where: { key: 'TITAN_PROGRESS' } }).catch(() => {});

        return NextResponse.json({ success: true, message: 'Sistema de redes neurais resetado com sucesso.' });

    } catch (error: any) {
        return NextResponse.json({ error: 'Falha ao resetar motores', details: error.message }, { status: 500 });
    }
}
