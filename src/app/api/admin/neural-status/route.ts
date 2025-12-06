import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
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

        // Get Exclusion LSTM status
        const exclusionNumbers = await prisma.exclusionCache.findFirst({
            where: { type: 'NUMBERS' },
            orderBy: { updatedAt: 'desc' }
        });

        const exclusionStars = await prisma.exclusionCache.findFirst({
            where: { type: 'STARS' },
            orderBy: { updatedAt: 'desc' }
        });

        // Helper function to calculate days since training
        const getDaysSince = (date: Date | null) => {
            if (!date) return undefined;
            const now = new Date();
            const diff = now.getTime() - new Date(date).getTime();
            return Math.floor(diff / (1000 * 60 * 60 * 24));
        };

        // Build model status array
        const models = [
            {
                name: 'Exclusion LSTM (Números)',
                type: 'EXCLUSION_NUMBERS',
                trained: !!exclusionNumbers,
                lastTrained: exclusionNumbers?.updatedAt || null,
                daysSinceTraining: getDaysSince(exclusionNumbers?.updatedAt || null),
                recommendedFrequency: 7, // 1 week
                scriptCommand: 'tools\\EXCLUSION_UPDATE.bat',
                estimatedTime: '10-20 seg'
            },
            {
                name: 'Exclusion LSTM (Estrelas)',
                type: 'EXCLUSION_STARS',
                trained: !!exclusionStars,
                lastTrained: exclusionStars?.updatedAt || null,
                daysSinceTraining: getDaysSince(exclusionStars?.updatedAt || null),
                recommendedFrequency: 7, // 1 week
                scriptCommand: 'tools\\EXCLUSION_UPDATE.bat',
                estimatedTime: '10-20 seg'
            },
            {
                name: 'LSTM Neural Net (Números)',
                type: 'LSTM',
                trained: true, // Assume trained if weights file exists
                lastTrained: null, // We don't track this currently
                daysSinceTraining: undefined,
                recommendedFrequency: 30, // 1 month
                scriptCommand: 'tools\\ML_UPDATE.bat',
                estimatedTime: '30-60 seg'
            },
            {
                name: 'Star LSTM Neural Net (Estrelas)',
                type: 'STAR_LSTM',
                trained: true, // Assume trained if weights file exists
                lastTrained: null, // We don't track this currently
                daysSinceTraining: undefined,
                recommendedFrequency: 30, // 1 month
                scriptCommand: 'tools\\ML_UPDATE.bat',
                estimatedTime: '30-60 seg'
            }
        ];

        // Get ML Models training status
        const lstmNumbers = await prisma.mLModelTraining.findUnique({
            where: { modelType: 'LSTM_NUMBERS' }
        });

        const lstmStars = await prisma.mLModelTraining.findUnique({
            where: { modelType: 'LSTM_STARS' }
        });

        // Update ML Models with database values
        const lstmNumbersModel = models.find(m => m.type === 'LSTM');
        const lstmStarsModel = models.find(m => m.type === 'STAR_LSTM');

        if (lstmNumbersModel) {
            lstmNumbersModel.trained = !!lstmNumbers;
            lstmNumbersModel.lastTrained = lstmNumbers?.lastTrained || null;
            lstmNumbersModel.daysSinceTraining = getDaysSince(lstmNumbers?.lastTrained || null);
        }

        if (lstmStarsModel) {
            lstmStarsModel.trained = !!lstmStars;
            lstmStarsModel.lastTrained = lstmStars?.lastTrained || null;
            lstmStarsModel.daysSinceTraining = getDaysSince(lstmStars?.lastTrained || null);
        }

        return NextResponse.json({
            success: true,
            models
        });

    } catch (error: any) {
        console.error('[API] Neural status error:', error);

        return NextResponse.json(
            {
                success: false,
                error: 'Erro ao obter estado dos modelos',
                details: error.message
            },
            { status: 500 }
        );
    }
}
