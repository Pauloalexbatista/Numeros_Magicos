import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { trainRandomForestModel } from '@/services/neural/rf-train-core';
import { NeuralPersistenceService } from '@/services/neural/persistence';

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (session?.user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { game, isStars } = await req.json();

        if (!game) {
            return NextResponse.json({ error: 'Missing game name' }, { status: 400 });
        }

        // Check if system is busy
        const isBusy = await NeuralPersistenceService.isSystemBusy();
        if (isBusy) {
            return NextResponse.json({ error: 'O sistema está ocupado com outro treino.' }, { status: 429 });
        }

        const modelType = `RF_${game}_${isStars ? 'STARS' : 'NUMBERS'}`;
        const maxVal = game === 'EUROMILLIONS' ? (isStars ? 12 : 50) 
                     : game === 'TOTOLOTO' ? (isStars ? 13 : 49)
                     : (isStars ? 5 : 40);

        // Run training in background (don't await fully to avoid timeout if possible, 
        // but RF is fast enough to await in many cases)
        // For safety on Vercel/Cloudflare, we might need a background worker, 
        // but on VPS we can await a few seconds.
        
        await NeuralPersistenceService.acquireLock('RF', game);
        
        const result = await trainRandomForestModel(game, isStars, maxVal, modelType);
        
        await NeuralPersistenceService.releaseLock();

        return NextResponse.json(result);

    } catch (error: any) {
        console.error('[API_TRAIN_RF] Error:', error);
        await NeuralPersistenceService.releaseLock();
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
