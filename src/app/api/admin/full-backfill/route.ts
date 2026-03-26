
import { NextResponse } from 'next/server';
import { EuroMillionsService } from '@/services/euroMillionsService';
import { TotolotoService } from '@/services/totolotoService';
import { EuroDreamsService } from '@/services/euroDreamsService';
import { evaluateDraw, evaluateDrawStars, updateRanking, cachePredictions } from '@/services/ranking';
import { prisma } from '@/lib/prisma';
import { processInBatches } from '@/utils/batch-processor';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const secret = searchParams.get('secret');

        if (secret !== 'magia2026') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.log('🚀 API Trigger: Starting Deep Backfill...');

        // Start in background (don't await the whole thing to avoid timeout)
        (async () => {
            try {
                const emService = new EuroMillionsService();
                const tlService = new TotolotoService();
                const edService = new EuroDreamsService();

                console.log('--- PHASE 1: SYNCING DRAWS ---');
                await emService.updateDatabase();
                await tlService.updateDatabase();
                await edService.updateDatabase();

                console.log('--- PHASE 2: EVALUATING DRAWS ---');
                const games = ['EUROMILLIONS', 'TOTOLOTO', 'EURODREAMS'];

                for (const game of games) {
                    const draws = await prisma.draw.findMany({
                        where: { game },
                        orderBy: { date: 'asc' }
                    });

                    await processInBatches(
                        draws,
                        10,
                        async (draw) => {
                            await evaluateDraw(draw.id);
                            await evaluateDrawStars(draw.id);
                        }
                    );
                }

                console.log('--- PHASE 3: FINAL UPDATES ---');
                await updateRanking();
                await cachePredictions();

                console.log('✅ GLOBAL BACKFILL COMPLETE!');
            } catch (err) {
                console.error('Backfill background error:', err);
            }
        })();

        return NextResponse.json({
            success: true,
            message: 'Processo de recuperação profunda iniciado em segundo plano.'
        });

    } catch (error: any) {
        console.error('Error in Full Backfill API:', error);
        return NextResponse.json(
            { error: 'Internal Server Error', details: error.message },
            { status: 500 }
        );
    }
}
