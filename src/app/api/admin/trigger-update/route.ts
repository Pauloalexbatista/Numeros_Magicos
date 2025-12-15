
import { NextResponse } from 'next/server';
import { predictionService } from '@/services/predictionService';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        // Authenticate? For now assume it's protected by middleware or obscure URL.
        // Or check for a secret header if needed.

        console.log('🔄 Admin Trigger: Starting prediction update...');

        await predictionService.generateAndCacheAllPredictions();

        return NextResponse.json({
            success: true,
            message: 'Predictions updated successfully'
        });

    } catch (error) {
        console.error('Error in Admin Trigger:', error);
        return NextResponse.json(
            { error: 'Internal Server Error', details: error instanceof Error ? error.message : 'Unknown' },
            { status: 500 }
        );
    }
}
