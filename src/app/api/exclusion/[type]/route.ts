import { NextRequest, NextResponse } from 'next/server';
import { getExclusionPrediction } from '@/services/exclusion-lstm';

/**
 * GET /api/exclusion/[type]
 * 
 * Get exclusion prediction for NUMBERS or STARS
 * Public API (cached, fast)
 */
export async function GET(
    request: NextRequest,
    { params }: { params: { type: string } }
) {
    try {
        const type = params.type.toUpperCase() as 'NUMBERS' | 'STARS';

        if (type !== 'NUMBERS' && type !== 'STARS') {
            return NextResponse.json(
                { error: 'Tipo inválido. Use "numbers" ou "stars".' },
                { status: 400 }
            );
        }

        const prediction = await getExclusionPrediction(type);

        return NextResponse.json({
            success: true,
            type,
            prediction: {
                excluded: prediction.excluded,
                confidence: prediction.confidence,
                lastDrawId: prediction.lastDrawId
            },
            info: {
                excludeCount: prediction.excluded.length,
                cached: true
            }
        });

    } catch (error: any) {
        console.error(`[API] Exclusion ${params.type} error:`, error);

        return NextResponse.json(
            {
                success: false,
                error: 'Erro ao obter previsão',
                details: error.message
            },
            { status: 500 }
        );
    }
}
