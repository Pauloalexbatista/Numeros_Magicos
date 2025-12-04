import { NextResponse } from 'next/server';
import { EuroMillionsService } from '@/services/euroMillionsService';

import { trainAllModels } from '@/services/ml/turboTraining';

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

        console.log('🔄 Cron job started: Update Database');

        const service = new EuroMillionsService();
        const hasNewDraw = await service.updateDatabase();

        if (hasNewDraw) {
            console.log('🧠 New draw detected! Spawning background ML Training...');

            // Spawn background process
            const { startBackgroundTraining } = await import('@/scripts/background-train');
            startBackgroundTraining();

            return NextResponse.json({
                success: true,
                message: 'Update process completed. ML Training started in background.',
                timestamp: new Date().toISOString()
            });
        } else {
            console.log('🧠 No new draw. Skipping ML Training.');

            return NextResponse.json({
                success: true,
                message: 'Update process completed. No new draw detected.',
                timestamp: new Date().toISOString()
            });
        }

        return NextResponse.json({
            success: true,
            message: 'Update process completed',
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Cron job failed:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
