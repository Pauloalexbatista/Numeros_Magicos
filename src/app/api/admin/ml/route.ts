import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { NeuralPersistenceService } from '@/services/neural/persistence';

// Helper to check the secret word
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
        const { game, targetNetwork } = body;

        if (!game || !targetNetwork) {
            return NextResponse.json({ error: 'Missing game or targetNetwork' }, { status: 400 });
        }

        // --- TRIGGER REAL TENSORFLOW SCRIPT ---
        console.log(`[ML_LAB] Internal check for game: ${game}, network: ${targetNetwork}`);

        // 🛡️ SECURITY LOCK: Check if system is busy
        if (await NeuralPersistenceService.isSystemBusy()) {
            return NextResponse.json({ 
                error: 'Sistema Ocupado: Existe outro treino em curso na VPS. Espera que termine para evitar sobrecarga.' 
            }, { status: 429 });
        }

        // 🔐 ACQUIRE LOCK
        await NeuralPersistenceService.acquireLock(targetNetwork, game);

        try {
            let result;
            if (targetNetwork === 'LSTM_EURODREAMS_DREAMS') {
                const { trainEuroDreamsDreams } = await import('@/services/neural/eurodreams-dreams-neural');
                result = await trainEuroDreamsDreams();
            } else if (targetNetwork === 'LSTM_EURODREAMS_NUMBERS') {
                const { trainEuroDreamsNumbers } = await import('@/services/neural/eurodreams-numbers-neural');
                result = await trainEuroDreamsNumbers();
            } else if (targetNetwork === 'LSTM_TOTOLOTO_LUCKY') {
                const { trainTotolotoLucky } = await import('@/services/neural/totoloto-lucky-neural');
                result = await trainTotolotoLucky();
            } else if (targetNetwork === 'LSTM_TOTOLOTO_NUMBERS') {
                const { trainTotolotoNumbers } = await import('@/services/neural/totoloto-numbers-neural');
                result = await trainTotolotoNumbers();
            } else if (targetNetwork === 'LSTM_STARS' || targetNetwork === 'LSTM_EUROMILLIONS_STARS') {
                const { trainEuromillionsStars } = await import('@/services/neural/euromillions-stars-neural');
                result = await trainEuromillionsStars();
            } else if (targetNetwork === 'LSTM_NUMBERS' || targetNetwork === 'LSTM_EUROMILLIONS_NUMBERS') {
                const { trainEuromillionsNumbers } = await import('@/services/neural/euromillions-numbers-neural');
                result = await trainEuromillionsNumbers();
            } else if (targetNetwork.startsWith('RF_')) {
                const { trainRandomForestModel } = await import('@/services/neural/rf-train-core');
                const targetParams = targetNetwork.split('_');
                const isStars = targetParams[2] === 'STARS' || targetParams[2] === 'DREAMS' || targetParams[2] === 'LUCKY';
                const gameName = targetParams[1] as string;
                
                let maxVal = 50;
                if (isStars) {
                    if (gameName === 'EUROMILLIONS') maxVal = 12;
                    if (gameName === 'EURODREAMS') maxVal = 5;
                    if (gameName === 'TOTOLOTO') maxVal = 13;
                } else {
                    if (gameName === 'EURODREAMS') maxVal = 40;
                    if (gameName === 'TOTOLOTO') maxVal = 49;
                }

                result = await trainRandomForestModel(game, isStars, maxVal, targetNetwork);
            } else if (targetNetwork.startsWith('CLASSIFIER_')) {
                const { trainMLClassifierModel } = await import('@/services/neural/classifier-train-core');
                const targetParams = targetNetwork.split('_');
                const isStars = targetParams[2] === 'STARS' || targetParams[2] === 'DREAMS' || targetParams[2] === 'LUCKY';
                const gameName = targetParams[1] as string;
                
                let maxVal = 50;
                if (isStars) {
                    if (gameName === 'EUROMILLIONS') maxVal = 12;
                    if (gameName === 'EURODREAMS') maxVal = 5;
                    if (gameName === 'TOTOLOTO') maxVal = 13;
                } else {
                    if (gameName === 'EURODREAMS') maxVal = 40;
                    if (gameName === 'TOTOLOTO') maxVal = 49;
                }

                result = await trainMLClassifierModel(game, isStars, maxVal, targetNetwork);
            } else {
                await new Promise(resolve => setTimeout(resolve, 2000));
                await prisma.mLModelTraining.upsert({
                    where: { modelType: targetNetwork },
                    update: { lastTrained: new Date() },
                    create: { modelType: targetNetwork, lastTrained: new Date() }
                });
                result = { success: true, message: `Treino simulado concluído para ${targetNetwork}` };
            }

            if (result && !result.success) {
                return NextResponse.json({ error: result.message }, { status: 500 });
            }

            return NextResponse.json({ 
                success: true, 
                message: result.message || `Treino da rede ${targetNetwork} concluído com sucesso.`
            });

        } catch (error: any) {
            console.error('Error triggering ML training:', error);
            return NextResponse.json({ error: 'Failed to trigger training', details: error.message }, { status: 500 });
        } finally {
            // 🔓 RELEASE LOCK
            await NeuralPersistenceService.releaseLock();
        }
    } catch (outerError: any) {
        console.error('Outer API Error:', outerError);
        return NextResponse.json({ error: 'Erro crítico na API', details: outerError.message }, { status: 500 });
    }
}
