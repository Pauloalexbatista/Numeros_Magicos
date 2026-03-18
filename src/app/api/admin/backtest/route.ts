import { NextResponse } from 'next/server';
import { runBacktest } from '../../../../services/neural/backtest-core';

export async function POST(req: Request) {
    try {
        const authHeader = req.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ') || authHeader.split(' ')[1] !== 'magia2026') {
            return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
        }

        const body = await req.json();
        const { game, targetNetwork, samples } = body;

        if (!game || !targetNetwork || !samples) {
            return NextResponse.json({ success: false, error: 'Faltam parâmetros obrigatórios (game, targetNetwork, samples).' }, { status: 400 });
        }

        const sampleSize = parseInt(samples, 10);
        if (isNaN(sampleSize) || sampleSize <= 0) {
            return NextResponse.json({ success: false, error: 'O número de sorteios a analisar tem de ser positivo.' }, { status: 400 });
        }

        // Call the backtest core engine
        const report = await runBacktest(game, targetNetwork, sampleSize);

        if (!report.success) {
            return NextResponse.json({ success: false, error: report.message }, { status: 500 });
        }

        return NextResponse.json({ 
            success: true, 
            report: report.data 
        });

    } catch (error: any) {
        console.error('[BACKTEST_API] Erro ao executar backtest:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
