import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { trainExclusionModel } from '@/services/exclusion-lstm';

/**
 * POST /api/admin/neural-train
 * 
 * Execute neural network training (Admin only)
 * 
 * ⚠️ CRITICAL: This endpoint executes OFFLINE training scripts
 * See: NEURAL_NETWORK_RULES.md
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
        const type = body.type as 'EXCLUSION' | 'ML_MODELS';

        if (!type || (type !== 'EXCLUSION' && type !== 'ML_MODELS')) {
            return NextResponse.json(
                { error: 'Tipo inválido. Use "EXCLUSION" ou "ML_MODELS".' },
                { status: 400 }
            );
        }

        console.log(`[API] Admin starting training for ${type}...`);
        const startTime = Date.now();

        // Execute training based on type
        if (type === 'EXCLUSION') {
            // Train both Exclusion models
            await trainExclusionModel('NUMBERS');
            await trainExclusionModel('STARS');
        } else if (type === 'ML_MODELS') {
            // Train ML Models (LSTM + Random Forest + Logistic Regression)
            const { trainAllModels } = await import('@/services/ml/turboTraining');

            console.log('[API] Starting ML Models training...');
            await trainAllModels();
            console.log('[API] ML Models training complete!');

            // Update ML Models training dates
            const { prisma } = await import('@/lib/prisma');

            // Update or create LSTM Numbers training record
            const numbersRecord = await prisma.mLModelTraining.upsert({
                where: { modelType: 'LSTM_NUMBERS' },
                update: { lastTrained: new Date(), updatedAt: new Date() },
                create: { modelType: 'LSTM_NUMBERS', lastTrained: new Date() }
            });
            console.log('[API] LSTM_NUMBERS record updated:', numbersRecord);

            // Update or create LSTM Stars training record
            const starsRecord = await prisma.mLModelTraining.upsert({
                where: { modelType: 'LSTM_STARS' },
                update: { lastTrained: new Date(), updatedAt: new Date() },
                create: { modelType: 'LSTM_STARS', lastTrained: new Date() }
            });
            console.log('[API] LSTM_STARS record updated:', starsRecord);

            console.log('[API] ML Models training dates updated');
        }

        const duration = Date.now() - startTime;
        console.log(`[API] Training complete in ${duration}ms`);

        return NextResponse.json({
            success: true,
            type,
            message: `Modelos ${type} treinados com sucesso`,
            duration: `${(duration / 1000).toFixed(1)}s`
        });

    } catch (error: any) {
        console.error('[API] Training error:', error);

        return NextResponse.json(
            {
                success: false,
                error: 'Erro ao treinar modelos',
                details: error.message
            },
            { status: 500 }
        );
    }
}

/**
 * GET /api/admin/neural-train  
 * 
 * Get training info
 */
export async function GET() {
    return NextResponse.json({
        info: 'Use POST para iniciar treino',
        example: {
            method: 'POST',
            body: { type: 'EXCLUSION' },
            requiredRole: 'ADMIN'
        },
        types: {
            EXCLUSION: 'Trains Exclusion LSTM (Numbers + Stars)',
            ML_MODELS: 'Trains LSTM Neural Net + Star LSTM (not implemented yet)'
        }
    });
}
