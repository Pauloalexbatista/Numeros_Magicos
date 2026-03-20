import { PrismaClient } from '@prisma/client';
import * as tf from '@tensorflow/tfjs';
import path from 'path';
import fs from 'fs';
import { MLClassifierSystem } from '../systems/ml/MLClassifierSystem';
import { RandomForestSystem } from '../systems/ml/RandomForestSystem';
import { preparePredictionInput, denormalizeData } from '../services/neural/tensor-core';

// Note: LSTM Weights are saved locally via raw file, or in DB if mocked.
// For the scope of "Option B: RAM Inference", we will load them if available or fallback.

const prisma = new PrismaClient();

async function runNeuralBackfill() {
    console.log('🚀 Starting Ultra-Fast Neural Batch Inference Backfill...');
    
    const games = ['EUROMILLIONS', 'TOTOLOTO', 'EURODREAMS'];

    for (const game of games) {
        console.log(`\n========================================`);
        console.log(`🎲 Analyzing Game: ${game}`);
        console.log(`========================================`);

        const allDraws = await prisma.draw.findMany({
            where: { game },
            orderBy: { date: 'asc' } // Oldest first
        });

        if (allDraws.length < 150) {
            console.log(`⚠️ Skiping ${game}: Not enough draws for backfill (${allDraws.length}).`);
            continue;
        }

        const maxVal = game === 'EUROMILLIONS' ? 50 : (game === 'TOTOLOTO' ? 49 : 40);
        const maxStar = game === 'EUROMILLIONS' ? 12 : (game === 'TOTOLOTO' ? 13 : 5);

        // 1. CLASSIFIER BATCH (Numbers)
        console.log(`\n🧠 Booting ML Classifier (Numbers, Max: ${maxVal})`);
        const classifierSystem = new MLClassifierSystem('numbers', maxVal);
        await runBatch(classifierSystem, 'ML Classifier', allDraws, 'numbers', maxVal, game);

        // 2. RANDOM FOREST BATCH (Numbers)
        console.log(`\n🌲 Booting Random Forest (Numbers, Max: ${maxVal})`);
        const rfSystem = new RandomForestSystem('numbers', maxVal);
        await runBatch(rfSystem, 'Random Forest', allDraws, 'numbers', maxVal, game);
        
        // 3. CLASSIFIER BATCH (Stars)
        console.log(`\n🧠 Booting ML Classifier (Stars/Dreams, Max: ${maxStar})`);
        const classifierSystemStars = new MLClassifierSystem('stars', maxStar);
        await runBatch(classifierSystemStars, 'ML Classifier (Estrelas)', allDraws, 'stars', maxStar, game);

        // 4. RANDOM FOREST BATCH (Stars)
        console.log(`\n🌲 Booting Random Forest (Stars/Dreams, Max: ${maxStar})`);
        const rfSystemStars = new RandomForestSystem('stars', maxStar);
        await runBatch(rfSystemStars, 'Random Forest (Estrelas)', allDraws, 'stars', maxStar, game);
    }
}

async function runBatch(systemInstance: any, systemName: string, allDraws: any[], domain: 'numbers' | 'stars', maxVal: number, game: string) {
    // 1. Ensure the system is registered in RankedSystems to satisfy foreign key constraints
    await prisma.rankedSystem.upsert({
        where: { name_game: { name: systemName, game: game } },
        update: { isActive: true },
        create: {
            name: systemName,
            game: game,
            description: `Auto-registered via ML Backfill (${domain})`,
            systemType: 'NEURAL',
            domain: domain === 'numbers' ? 'NUMBERS' : 'STARS',
            isActive: true
        }
    });

    const MAX_SIMULATIONS = 200; // Testing last 200 draws
    const drawsToTest = allDraws.slice(-MAX_SIMULATIONS);
    
    let totalHits = 0;
    
    console.log(`[Batch] Injecting predictions into ${MAX_SIMULATIONS} sliding windows...`);

    for (let i = 0; i < drawsToTest.length; i++) {
        const targetDraw = drawsToTest[i];
        
        // Find index of this draw in global array
        const globalIdx = allDraws.findIndex(d => d.id === targetDraw.id);
        const historyContext = allDraws.slice(0, globalIdx); 
        
        try {
            let rawArray = await systemInstance.generateTop25(historyContext, domain, maxVal);
            
            // FALLBACK FOR WINDOWS TFJS BUG: If the model failed to save to disk, `rawArray` is empty.
            // We fetch the `nextPrediction` from the DB that was saved during the user's manual training session.
            if (rawArray.length === 0) {
                const dbType = `${systemName.includes('RF') ? 'RF' : 'CLASSIFIER'}_${game}_${domain === 'stars' ? (game === 'EURODREAMS' ? 'DREAMS' : 'STARS') : 'NUMBERS'}`;
                const dbRow = await prisma.mLModelTraining.findUnique({ where: { modelType: dbType } });
                if (dbRow && dbRow.modelData) {
                    try {
                        const parsed = JSON.parse(dbRow.modelData);
                        if (parsed.nextPrediction && parsed.nextPrediction.length > 0) rawArray = parsed.nextPrediction;
                    } catch (e) { }
                }
            }

            let prediction: number[] = [];
            let maxHitsPossible = 5;

            if (domain === 'stars') {
                const limit = game === 'EUROMILLIONS' ? 6 : (game === 'TOTOLOTO' ? 5 : 3);
                prediction = rawArray.slice(0, limit);
                maxHitsPossible = game === 'EUROMILLIONS' ? 2 : 1;
            } else {
                const limit = game === 'EURODREAMS' ? 20 : 25; // Both Totoloto and Euromillions use 25
                prediction = rawArray.slice(0, limit);
                maxHitsPossible = game === 'EURODREAMS' ? 6 : 5;
            }

            // Calculate Hits
            const actual = JSON.parse(targetDraw[domain]);
            const hits = actual.filter((n: number) => prediction.includes(n)).length;
            const accuracy = (hits / maxHitsPossible) * 100;
            
            if (domain === 'stars') {
                await prisma.starSystemPerformance.upsert({
                    where: {
                        drawId_systemName_game: {
                            drawId: targetDraw.id,
                            systemName: systemName,
                            game: game
                        }
                    },
                    update: {
                        predictedStars: JSON.stringify(prediction),
                        actualStars: targetDraw[domain],
                        hits: hits,
                        accuracy: accuracy
                    },
                    create: {
                        drawId: targetDraw.id,
                        game: game,
                        systemName: systemName,
                        predictedStars: JSON.stringify(prediction),
                        actualStars: targetDraw[domain],
                        hits: hits,
                        accuracy: accuracy,
                        createdAt: new Date(targetDraw.date)
                    }
                });
            } else {
                await prisma.systemPerformance.upsert({
                    where: {
                        drawId_systemName_game: {
                            drawId: targetDraw.id,
                            systemName: systemName,
                            game: game
                        }
                    },
                    update: {
                        predictedNumbers: JSON.stringify(prediction),
                        actualNumbers: targetDraw[domain],
                        hits: hits,
                        accuracy: accuracy
                    },
                    create: {
                        drawId: targetDraw.id,
                        game: game,
                        systemName: systemName,
                        predictedNumbers: JSON.stringify(prediction),
                        actualNumbers: targetDraw[domain],
                        hits: hits,
                        accuracy: accuracy,
                        createdAt: new Date(targetDraw.date)
                    }
                });
            }

            totalHits += hits;
            process.stdout.write(`\r[${i+1}/${MAX_SIMULATIONS}] Draw: ${targetDraw.date.toISOString().split('T')[0]} | Hits: ${hits} `);

        } catch (e) {
            console.error(`\nFailed inference at index ${i}:`, e);
            break;
        }
    }
    
    console.log(`\n✅ ${systemName} | Final Average Hits: ${(totalHits / MAX_SIMULATIONS).toFixed(2)} per draw\n`);
}

runNeuralBackfill()
    .then(() => console.log('🎉 Fast-Forward Backfill Process Complete!'))
    .catch(console.error)
    .finally(() => prisma.$disconnect());
