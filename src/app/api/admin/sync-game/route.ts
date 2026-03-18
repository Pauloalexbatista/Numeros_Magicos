import { NextResponse } from 'next/server';
import { EuroMillionsService } from '@/services/euroMillionsService';
import { EuroDreamsService } from '@/services/euroDreamsService';
import { TotolotoService } from '@/services/totolotoService';
import { predictionService } from '@/services/predictionService';

export const dynamic = 'force-dynamic';

function hasValidSecret(request: Request) {
    const authHeader = request.headers.get('Authorization');
    return authHeader === 'Bearer magia2026';
}

export async function POST(request: Request) {
    if (!hasValidSecret(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { game } = body;

        console.log(`🔄 Admin Sync: Starting sync for ${game}...`);

        if (game === 'EUROMILLIONS') {
            const emService = new EuroMillionsService();
            await emService.updateDatabase();
            await predictionService.generateAndCachePredictions('EUROMILLIONS');
        } else if (game === 'EURODREAMS') {
            const edService = new EuroDreamsService();
            await edService.updateDatabase();
            await predictionService.generateAndCachePredictions('EURODREAMS');
        } else if (game === 'TOTOLOTO') {
            const ttService = new TotolotoService();
            await ttService.updateDatabase();
            await predictionService.generateAndCachePredictions('TOTOLOTO');
        } else {
            return NextResponse.json({ error: 'Target game unknown or invalid' }, { status: 400 });
        }

        console.log(`✅ Admin Sync: Completed sync for ${game}.`);

        return NextResponse.json({
            success: true,
            message: `Sync completed for ${game}`
        });

    } catch (error) {
        console.error('Error in Admin Sync:', error);
        return NextResponse.json(
            { error: 'Internal Server Error', details: error instanceof Error ? error.message : 'Unknown' },
            { status: 500 }
        );
    }
}
