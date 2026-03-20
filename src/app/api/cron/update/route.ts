import { NextResponse } from 'next/server';
import { EuroMillionsService } from '@/services/euroMillionsService';
import { TotolotoService } from '@/services/totolotoService';
import { EuroDreamsService } from '@/services/euroDreamsService';

export const dynamic = 'force-dynamic'; // Prevent caching

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const key = searchParams.get('key');
        const authHeader = request.headers.get('authorization');

        const secret = process.env.CRON_SECRET || 'secure-cron-key';

        // Check authentication (Query param or Bearer token)
        if (key !== secret && authHeader !== `Bearer ${secret}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Detect day of week to call the correct game service
        // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
        const day = new Date().getDay();
        const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

        // Draw schedule:
        // Mon(1) / Thu(4) → EuroDreams
        // Tue(2) / Fri(5) → EuroMillions
        // Wed(3) / Sat(6) → Totoloto
        type GameEntry = { game: string; service: () => { updateDatabase: () => Promise<boolean> } };
        const drawSchedule: Record<number, GameEntry> = {
            1: { game: 'EuroDreams', service: () => new EuroDreamsService() },
            4: { game: 'EuroDreams', service: () => new EuroDreamsService() },
            2: { game: 'EuroMillions', service: () => new EuroMillionsService() },
            5: { game: 'EuroMillions', service: () => new EuroMillionsService() },
            3: { game: 'Totoloto', service: () => new TotolotoService() },
            6: { game: 'Totoloto', service: () => new TotolotoService() },
        };

        const todaySchedule = drawSchedule[day];

        if (!todaySchedule) {
            console.log(`⏭️ [Cron] ${dayNames[day]} — Nenhum sorteio hoje. A saltar.`);
            return NextResponse.json({
                success: true,
                message: `Nenhum sorteio ao ${dayNames[day]}. Cron ignorado.`,
                day: dayNames[day],
                timestamp: new Date().toISOString()
            });
        }

        console.log(`🔄 [Cron] ${dayNames[day]} — A actualizar ${todaySchedule.game}...`);

        const service = todaySchedule.service();
        const hasNewDraw = await service.updateDatabase();

        if (hasNewDraw) {
            console.log(`✅ [Cron] Novo sorteio detectado! ${todaySchedule.game} actualizado.`);

            // Trigger background ML Training for the specific game that dropped today
            console.log(`🧠 A iniciar o ML Turbo-Training em background para ${todaySchedule.game}...`);
            const { startBackgroundTraining } = await import('@/scripts/ml-training/background-train');
            startBackgroundTraining(todaySchedule.game);

            return NextResponse.json({
                success: true,
                game: todaySchedule.game,
                message: `${todaySchedule.game} actualizado com sucesso.`,
                newDraw: true,
                timestamp: new Date().toISOString()
            });
        } else {
            console.log(`ℹ️ [Cron] ${todaySchedule.game} — Nenhum novo sorteio.`);
            return NextResponse.json({
                success: true,
                game: todaySchedule.game,
                message: `${todaySchedule.game}: nenhum sorteio novo detectado.`,
                newDraw: false,
                timestamp: new Date().toISOString()
            });
        }

    } catch (error) {
        console.error('❌ Cron job failed:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
