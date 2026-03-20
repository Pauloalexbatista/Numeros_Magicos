import { PrismaClient } from '@prisma/client';
import { MLClassifierSystem } from '../systems/ml/MLClassifierSystem';
import { RandomForestSystem } from '../systems/ml/RandomForestSystem';
import { trainRandomForestModel } from '../services/neural/rf-train-core';
import { trainMLClassifierModel } from '../services/neural/classifier-train-core';

const prisma = new PrismaClient();

async function runSplitBackfill() {
    console.log('🚀 Starting TIERED SPLIT Neural Backfill (Quarterly Retraining)...');
    
    // Wipe Old Inflated Scores
    await prisma.systemPerformance.deleteMany({
        where: { systemName: { in: ['Random Forest', 'ML Classifier'] } }
    });
    await prisma.starSystemPerformance.deleteMany({
        where: { systemName: { in: ['Random Forest (Estrelas)', 'ML Classifier (Estrelas)'] } }
    });

    const games = ['EUROMILLIONS', 'TOTOLOTO', 'EURODREAMS'];

    for (const game of games) {
        console.log(`\n========================================`);
        console.log(`🎲 Analyzing Game (Split-Forward Train/Test): ${game}`);
        console.log(`========================================`);

        const allDraws = await prisma.draw.findMany({
            where: { game },
            orderBy: { date: 'asc' } // Oldest first
        });

        // Test ~1.5 years (156 draws)
        const maxDrawsToTest = 150; 
        if (allDraws.length < maxDrawsToTest + 50) continue;

        const maxVal = game === 'EUROMILLIONS' ? 50 : (game === 'TOTOLOTO' ? 49 : 40);
        const maxStar = game === 'EUROMILLIONS' ? 12 : (game === 'TOTOLOTO' ? 13 : 5);

        // STRIDE size: 25 draws = ~3 Months (Quarterly Validation)
        const STRIDE_QUARTER = 25;

        // 1. RANDOM FOREST
        const rfSystem = new RandomForestSystem('numbers', maxVal);
        await runStridedBatch(rfSystem, 'Random Forest', allDraws, 'numbers', maxVal, game, true, maxDrawsToTest, STRIDE_QUARTER);
        
        const rfSystemStars = new RandomForestSystem('stars', maxStar);
        await runStridedBatch(rfSystemStars, 'Random Forest (Estrelas)', allDraws, 'stars', maxStar, game, true, maxDrawsToTest, STRIDE_QUARTER);

        // 2. ML CLASSIFIER (Deep Learning)
        const classifierSystem = new MLClassifierSystem('numbers', maxVal);
        await runStridedBatch(classifierSystem, 'ML Classifier', allDraws, 'numbers', maxVal, game, false, maxDrawsToTest, STRIDE_QUARTER);

        const classifierSystemStars = new MLClassifierSystem('stars', maxStar);
        await runStridedBatch(classifierSystemStars, 'ML Classifier (Estrelas)', allDraws, 'stars', maxStar, game, false, maxDrawsToTest, STRIDE_QUARTER);
    }
}

async function runStridedBatch(
    systemInstance: any, 
    systemName: string, 
    allDraws: any[], 
    domain: 'numbers' | 'stars', 
    maxVal: number, 
    game: string,
    isRF: boolean,
    totalDrawsToTest: number,
    stride: number
) {
    // Register Keys Safely
    await prisma.rankedSystem.upsert({
        where: { name_game: { name: systemName, game: game } },
        update: { isActive: true },
        create: { name: systemName, game: game, description: `Auto-registered via ML Split-Forward Backfill`, systemType: 'NEURAL', domain: domain === 'numbers' ? 'NUMBERS' : 'STARS', isActive: true }
    });

    console.log(`\n[Strided Validation] Quarterly Evaluation for ${systemName}...`);

    let totalHits = 0;
    const startIndex = allDraws.length - totalDrawsToTest;

    for (let chunkStartOffset = startIndex; chunkStartOffset < allDraws.length; chunkStartOffset += stride) {
        
        // 1. TRAIN ONCE per Quarter (Model never sees the chunk's target draws)
        const historyForTraining = allDraws.slice(0, chunkStartOffset);
        const modelDbKey = `${isRF ? 'RF' : 'CLASSIFIER'}_${game}_${domain === 'stars' ? (game === 'EURODREAMS' ? 'DREAMS' : 'STARS') : 'NUMBERS'}`;
        
        const anchorDate = new Date(historyForTraining[historyForTraining.length - 1].date).toISOString().split('T')[0];
        console.log(`\n -> 🧠 Retraining Brain (Pre-Chunk Knowledge Frozen at: ${anchorDate})`);
        
        if (isRF) {
            await trainRandomForestModel(game, domain === 'stars', maxVal, modelDbKey, historyForTraining);
        } else {
            await trainMLClassifierModel(game, domain === 'stars', maxVal, modelDbKey, historyForTraining);
        }
        
        // 2. EVALUATE out-of-sample block sequentially (Using Frozen Brain)
        const chunkEndOffset = Math.min(chunkStartOffset + stride, allDraws.length);
        const drawsInThisQuarter = allDraws.slice(chunkStartOffset, chunkEndOffset);
        
        let chunkHits = 0;
        
        for (const targetDraw of drawsInThisQuarter) {
            const targetGlobalIdx = allDraws.findIndex(d => d.id === targetDraw.id);
            const contextForFeatures = allDraws.slice(0, targetGlobalIdx);
            
            // Generate prediction using frozen model mapping the target's recent context
            let rawArray = await systemInstance.generateTop25(contextForFeatures, domain, maxVal);
            
            if (rawArray.length === 0) { 
                 rawArray = Array.from({length: 25}, (_, j) => j + 1);
            }

            let prediction: number[] = [];
            let maxHitsPossible = 5;

            if (domain === 'stars') {
                const limit = game === 'EUROMILLIONS' ? 6 : (game === 'TOTOLOTO' ? 5 : 3);
                prediction = rawArray.slice(0, limit);
                maxHitsPossible = game === 'EUROMILLIONS' ? 2 : 1;
            } else {
                const limit = game === 'EURODREAMS' ? 20 : 25; 
                prediction = rawArray.slice(0, limit);
                maxHitsPossible = game === 'EURODREAMS' ? 6 : 5;
            }

            // Calculate Authentic Hits
            const actual = JSON.parse(targetDraw[domain]);
            const hits = actual.filter((n: number) => prediction.includes(n)).length;
            const accuracy = (hits / maxHitsPossible) * 100;
            
            if (domain === 'stars') {
                await prisma.starSystemPerformance.upsert({
                    where: { drawId_systemName_game: { drawId: targetDraw.id, systemName: systemName, game: game } },
                    update: { predictedStars: JSON.stringify(prediction), actualStars: targetDraw[domain], hits: hits, accuracy: accuracy },
                    create: { drawId: targetDraw.id, game: game, systemName: systemName, predictedStars: JSON.stringify(prediction), actualStars: targetDraw[domain], hits: hits, accuracy: accuracy, createdAt: new Date(targetDraw.date) }
                });
            } else {
                await prisma.systemPerformance.upsert({
                    where: { drawId_systemName_game: { drawId: targetDraw.id, systemName: systemName, game: game } },
                    update: { predictedNumbers: JSON.stringify(prediction), actualNumbers: targetDraw[domain], hits: hits, accuracy: accuracy },
                    create: { drawId: targetDraw.id, game: game, systemName: systemName, predictedNumbers: JSON.stringify(prediction), actualNumbers: targetDraw[domain], hits: hits, accuracy: accuracy, createdAt: new Date(targetDraw.date) }
                });
            }

            chunkHits += hits;
            process.stdout.write(`.`);
        }
        
        console.log(` Batch Hits: ${chunkHits}`);
        totalHits += chunkHits;
    }
    
    console.log(`✅ ${systemName} | True Split-Forward Average: ${(totalHits / totalDrawsToTest).toFixed(2)} per draw\n`);
}

runSplitBackfill()
    .then(() => console.log('🎉 Mathematically Rigorous Strided Backfill Complete! NO DATA LEAKAGE!'))
    .catch(console.error)
    .finally(() => prisma.$disconnect());
