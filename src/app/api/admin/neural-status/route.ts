import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Helper to check the secret word
function hasValidSecret(request: Request) {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');
    return secret === 'magia2026';
}

// GET /api/admin/neural-status
export async function GET(request: Request) {
    try {
        if (!hasValidSecret(request)) {
            // Also checking auth header as fallback just in case
            const authHeader = request.headers.get('Authorization');
            const headerSecret = authHeader?.split('Bearer ')[1];
            if (headerSecret !== 'magia2026') {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }
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

        // Get ML Models training status
        const lstmNumbers = await prisma.mLModelTraining.findUnique({
            where: { modelType: 'LSTM_NUMBERS' }
        });

        const lstmStars = await prisma.mLModelTraining.findUnique({
            where: { modelType: 'LSTM_STARS' }
        });

        // Get EuroDreams ML Models training status
        const lstmEuroDreamsDreams = await prisma.mLModelTraining.findUnique({
            where: { modelType: 'LSTM_EURODREAMS_DREAMS' }
        });

        // Get Totoloto ML Models training status
        const lstmTotolotoLucky = await prisma.mLModelTraining.findUnique({
            where: { modelType: 'LSTM_TOTOLOTO_LUCKY' }
        });

        // Get Number Models training status
        const lstmEuroMillionsNumbers = await prisma.mLModelTraining.findUnique({
            where: { modelType: 'LSTM_NUMBERS' } // EuroMillions uses this historic name
        });
        const lstmEuroDreamsNumbers = await prisma.mLModelTraining.findUnique({
            where: { modelType: 'LSTM_EURODREAMS_NUMBERS' }
        });
        const lstmTotolotoNumbers = await prisma.mLModelTraining.findUnique({
            where: { modelType: 'LSTM_TOTOLOTO_NUMBERS' }
        });

        // -----------------------------------------------------
        // FASE 5: RANDOM FOREST MODELS STATUS
        // -----------------------------------------------------
        const rfEuroMillionsStars = await prisma.mLModelTraining.findUnique({ where: { modelType: 'RF_EUROMILLIONS_STARS' } });
        const rfEuroMillionsNumbers = await prisma.mLModelTraining.findUnique({ where: { modelType: 'RF_EUROMILLIONS_NUMBERS' } });
        
        const rfEuroDreamsStars = await prisma.mLModelTraining.findUnique({ where: { modelType: 'RF_EURODREAMS_STARS' } });
        const rfEuroDreamsNumbers = await prisma.mLModelTraining.findUnique({ where: { modelType: 'RF_EURODREAMS_NUMBERS' } });
        
        const rfTotolotoStars = await prisma.mLModelTraining.findUnique({ where: { modelType: 'RF_TOTOLOTO_STARS' } });
        const rfTotolotoNumbers = await prisma.mLModelTraining.findUnique({ where: { modelType: 'RF_TOTOLOTO_NUMBERS' } });

        // -----------------------------------------------------
        // FASE 6: ML CLASSIFIER MODELS STATUS
        // -----------------------------------------------------
        const clfEuroMillionsStars = await prisma.mLModelTraining.findUnique({ where: { modelType: 'CLASSIFIER_EUROMILLIONS_STARS' } });
        const clfEuroMillionsNumbers = await prisma.mLModelTraining.findUnique({ where: { modelType: 'CLASSIFIER_EUROMILLIONS_NUMBERS' } });
        
        const clfEuroDreamsStars = await prisma.mLModelTraining.findUnique({ where: { modelType: 'CLASSIFIER_EURODREAMS_STARS' } });
        const clfEuroDreamsNumbers = await prisma.mLModelTraining.findUnique({ where: { modelType: 'CLASSIFIER_EURODREAMS_NUMBERS' } });
        
        const clfTotolotoStars = await prisma.mLModelTraining.findUnique({ where: { modelType: 'CLASSIFIER_TOTOLOTO_STARS' } });
        const clfTotolotoNumbers = await prisma.mLModelTraining.findUnique({ where: { modelType: 'CLASSIFIER_TOTOLOTO_NUMBERS' } });



        // Helper function to calculate days since training
        
        const getModelMeta = (model: any) => {
            if (!model || !model.modelData) return { accuracy: null, nextPrediction: null };
            try {
                const parsed = (typeof model.modelData === "string" ? JSON.parse(model.modelData) : model.modelData);
                const formattedAccuracy = typeof parsed.accuracy === 'number' 
                    ? parseFloat(parsed.accuracy.toFixed(2)) 
                    : (parsed.accuracy || null);
                return { accuracy: formattedAccuracy, nextPrediction: parsed.nextPrediction || null };
            } catch {
                return { accuracy: null, nextPrediction: null };
            }
        };

        const getDaysSince = (date: Date | null | undefined) => {
            if (!date) return undefined;
            const now = new Date();
            const diff = now.getTime() - new Date(date).getTime();
            return Math.floor(diff / (1000 * 60 * 60 * 24));
        };

        // Build a structured response by Game
        const status = {
            EUROMILLIONS: {
                STARS: {
                    type: 'LSTM_STARS',
                    name: 'LSTM Estrelas',
                    isSecondary: true, // Marked as secondary (starts first)
                    trained: !!lstmStars,
                    lastTrained: lstmStars?.lastTrained || null,
                    daysSinceTraining: getDaysSince(lstmStars?.lastTrained),
                    ...getModelMeta(lstmStars)
                },
                NUMBERS: {
                    type: 'LSTM_NUMBERS',
                    name: 'LSTM Números',
                    isSecondary: false,
                    trained: !!lstmEuroMillionsNumbers,
                    lastTrained: lstmEuroMillionsNumbers?.lastTrained || null,
                    daysSinceTraining: getDaysSince(lstmEuroMillionsNumbers?.lastTrained),
                    ...getModelMeta(lstmEuroMillionsNumbers)
                },
                EXCLUSION_STARS: {
                    type: 'EXCLUSION_STARS',
                    name: 'LSTM Exclusão (Estrelas)',
                    trained: !!exclusionStars,
                    lastTrained: exclusionStars?.updatedAt || null,
                    daysSinceTraining: getDaysSince(exclusionStars?.updatedAt)
                },
                EXCLUSION_NUMBERS: {
                    type: 'EXCLUSION_NUMBERS',
                    name: 'LSTM Exclusão (Números)',
                    trained: !!exclusionNumbers,
                    lastTrained: exclusionNumbers?.updatedAt || null,
                    daysSinceTraining: getDaysSince(exclusionNumbers?.updatedAt)
                }
            },
            EURODREAMS: {
                STARS: {
                    type: 'LSTM_EURODREAMS_DREAMS',
                    name: 'LSTM Sonhos (Estrelas)',
                    isSecondary: true,
                    trained: !!lstmEuroDreamsDreams,
                    lastTrained: lstmEuroDreamsDreams?.lastTrained || null,
                    daysSinceTraining: getDaysSince(lstmEuroDreamsDreams?.lastTrained),
                    ...getModelMeta(lstmEuroDreamsDreams)
                },
                NUMBERS: {
                    type: 'LSTM_EURODREAMS_NUMBERS',
                    name: 'LSTM Números',
                    isSecondary: false,
                    trained: !!lstmEuroDreamsNumbers,
                    lastTrained: lstmEuroDreamsNumbers?.lastTrained || null,
                    daysSinceTraining: getDaysSince(lstmEuroDreamsNumbers?.lastTrained),
                    ...getModelMeta(lstmEuroDreamsNumbers)
                }
            },
            TOTOLOTO: {
                LUCKY_NUMBER: {
                    type: 'LSTM_TOTOLOTO_LUCKY',
                    name: 'LSTM Número da Sorte',
                    isSecondary: true,
                    trained: !!lstmTotolotoLucky,
                    lastTrained: lstmTotolotoLucky?.lastTrained || null,
                    daysSinceTraining: getDaysSince(lstmTotolotoLucky?.lastTrained),
                    ...getModelMeta(lstmTotolotoLucky)
                },
                NUMBERS: {
                    type: 'LSTM_TOTOLOTO_NUMBERS',
                    name: 'LSTM Números',
                    isSecondary: false,
                    trained: !!lstmTotolotoNumbers,
                    lastTrained: lstmTotolotoNumbers?.lastTrained || null,
                    daysSinceTraining: getDaysSince(lstmTotolotoNumbers?.lastTrained),
                    ...getModelMeta(lstmTotolotoNumbers)
                },
                RF_STARS: {
                    type: 'RF_TOTOLOTO_STARS',
                    name: 'Random Forest (Sorte)',
                    isSecondary: true,
                    trained: !!rfTotolotoStars,
                    lastTrained: rfTotolotoStars?.lastTrained || null,
                    daysSinceTraining: getDaysSince(rfTotolotoStars?.lastTrained),
                    ...getModelMeta(rfTotolotoStars)
                },
                RF_NUMBERS: {
                    type: 'RF_TOTOLOTO_NUMBERS',
                    name: 'Random Forest (Números)',
                    isSecondary: false,
                    trained: !!rfTotolotoNumbers,
                    lastTrained: rfTotolotoNumbers?.lastTrained || null,
                    daysSinceTraining: getDaysSince(rfTotolotoNumbers?.lastTrained),
                    ...getModelMeta(rfTotolotoNumbers)
                },
                CLASSIFIER_STARS: {
                    type: 'CLASSIFIER_TOTOLOTO_STARS',
                    name: 'ML Classifier (Sorte)',
                    isSecondary: true,
                    trained: !!clfTotolotoStars,
                    lastTrained: clfTotolotoStars?.lastTrained || null,
                    daysSinceTraining: getDaysSince(clfTotolotoStars?.lastTrained),
                    ...getModelMeta(clfTotolotoStars)
                },
                CLASSIFIER_NUMBERS: {
                    type: 'CLASSIFIER_TOTOLOTO_NUMBERS',
                    name: 'ML Classifier (Números)',
                    isSecondary: false,
                    trained: !!clfTotolotoNumbers,
                    lastTrained: clfTotolotoNumbers?.lastTrained || null,
                    daysSinceTraining: getDaysSince(clfTotolotoNumbers?.lastTrained),
                    ...getModelMeta(clfTotolotoNumbers)
                }
            }
        };

        // Inject EuroMillions RF Models
        status.EUROMILLIONS['RF_STARS'] = {
            type: 'RF_EUROMILLIONS_STARS',
            name: 'Random Forest (Estrelas)',
            isSecondary: true,
            trained: !!rfEuroMillionsStars,
            lastTrained: rfEuroMillionsStars?.lastTrained || null,
            daysSinceTraining: getDaysSince(rfEuroMillionsStars?.lastTrained),
                    ...getModelMeta(rfEuroMillionsStars)
        };
        status.EUROMILLIONS['RF_NUMBERS'] = {
            type: 'RF_EUROMILLIONS_NUMBERS',
            name: 'Random Forest (Números)',
            isSecondary: false,
            trained: !!rfEuroMillionsNumbers,
            lastTrained: rfEuroMillionsNumbers?.lastTrained || null,
            daysSinceTraining: getDaysSince(rfEuroMillionsNumbers?.lastTrained),
                    ...getModelMeta(rfEuroMillionsNumbers)
        };
        
        // Inject EuroMillions Classifier Models
        status.EUROMILLIONS['CLASSIFIER_STARS'] = {
            type: 'CLASSIFIER_EUROMILLIONS_STARS',
            name: 'ML Classifier (Estrelas)',
            isSecondary: true,
            trained: !!clfEuroMillionsStars,
            lastTrained: clfEuroMillionsStars?.lastTrained || null,
            daysSinceTraining: getDaysSince(clfEuroMillionsStars?.lastTrained),
                    ...getModelMeta(clfEuroMillionsStars)
        };
        status.EUROMILLIONS['CLASSIFIER_NUMBERS'] = {
            type: 'CLASSIFIER_EUROMILLIONS_NUMBERS',
            name: 'ML Classifier (Números)',
            isSecondary: false,
            trained: !!clfEuroMillionsNumbers,
            lastTrained: clfEuroMillionsNumbers?.lastTrained || null,
            daysSinceTraining: getDaysSince(clfEuroMillionsNumbers?.lastTrained),
                    ...getModelMeta(clfEuroMillionsNumbers)
        };

        // Inject EuroDreams RF Models
        status.EURODREAMS['RF_STARS'] = {
            type: 'RF_EURODREAMS_STARS',
            name: 'Random Forest (Sonhos)',
            isSecondary: true,
            trained: !!rfEuroDreamsStars,
            lastTrained: rfEuroDreamsStars?.lastTrained || null,
            daysSinceTraining: getDaysSince(rfEuroDreamsStars?.lastTrained),
                    ...getModelMeta(rfEuroDreamsStars)
        };
        status.EURODREAMS['RF_NUMBERS'] = {
            type: 'RF_EURODREAMS_NUMBERS',
            name: 'Random Forest (Números)',
            isSecondary: false,
            trained: !!rfEuroDreamsNumbers,
            lastTrained: rfEuroDreamsNumbers?.lastTrained || null,
            daysSinceTraining: getDaysSince(rfEuroDreamsNumbers?.lastTrained),
                    ...getModelMeta(rfEuroDreamsNumbers)
        };

        // Inject EuroDreams Classifier Models
        status.EURODREAMS['CLASSIFIER_STARS'] = {
            type: 'CLASSIFIER_EURODREAMS_STARS',
            name: 'ML Classifier (Sonhos)',
            isSecondary: true,
            trained: !!clfEuroDreamsStars,
            lastTrained: clfEuroDreamsStars?.lastTrained || null,
            daysSinceTraining: getDaysSince(clfEuroDreamsStars?.lastTrained),
                    ...getModelMeta(clfEuroDreamsStars)
        };
        status.EURODREAMS['CLASSIFIER_NUMBERS'] = {
            type: 'CLASSIFIER_EURODREAMS_NUMBERS',
            name: 'ML Classifier (Números)',
            isSecondary: false,
            trained: !!clfEuroDreamsNumbers,
            lastTrained: clfEuroDreamsNumbers?.lastTrained || null,
            daysSinceTraining: getDaysSince(clfEuroDreamsNumbers?.lastTrained),
                    ...getModelMeta(clfEuroDreamsNumbers)
        };

        return NextResponse.json({
            success: true,
            status
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
