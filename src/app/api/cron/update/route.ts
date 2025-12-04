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
        await service.updateDatabase();

        console.log('🧠 Cron job: Starting ML Training...');
        await trainAllModels();

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
