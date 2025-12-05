import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { forceRetrain } from '@/services/exclusion-lstm';

/**
 * POST /api/exclusion/retrain
 * 
 * Force LSTM model retraining (Admin only)
 */
export async function POST(request: NextRequest) {
    try {
        // Check authentication
        const session = await auth();

        if (!session || !session.user) {
            return NextResponse.json(
                { error: 'Não autenticado' },
                { status: 401 }
            );
        }

        // Check if user is admin
        const userRole = (session.user as any).role;
        if (userRole !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Acesso negado. Apenas administradores.' },
                { status: 403 }
            );
        }

        // Get type from request body
        const body = await request.json();
        const type = body.type as 'NUMBERS' | 'STARS';

        if (!type || (type !== 'NUMBERS' && type !== 'STARS')) {
            return NextResponse.json(
                { error: 'Tipo inválido. Use "NUMBERS" ou "STARS".' },
                { status: 400 }
            );
        }

        // Force retrain
        console.log(`[API] Admin forcing retrain for ${type}...`);
        const startTime = Date.now();

        await forceRetrain(type);

        const duration = Date.now() - startTime;
        console.log(`[API] Retrain complete in ${duration}ms`);

        return NextResponse.json({
            success: true,
            type,
            message: `Modelo ${type} retreinado com sucesso`,
            duration: `${(duration / 1000).toFixed(1)}s`
        });

    } catch (error: any) {
        console.error('[API] Retrain error:', error);

        return NextResponse.json(
            {
                success: false,
                error: 'Erro ao retreinar modelo',
                details: error.message
            },
            { status: 500 }
        );
    }
}

/**
 * GET /api/exclusion/retrain  
 * 
 * Get retrain status/info
 */
export async function GET() {
    return NextResponse.json({
        info: 'Use POST para forçar retreino',
        example: {
            method: 'POST',
            body: { type: 'NUMBERS' },
            requiredRole: 'ADMIN'
        }
    });
}
