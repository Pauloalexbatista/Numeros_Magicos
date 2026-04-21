import { PrismaClient } from '@prisma/client';
import { LSTMSystem } from '../systems/ml/LSTMSystem';
import { trainEuromillionsNumbers } from '../services/neural/euromillions-numbers-neural';
import { trainEuromillionsStars } from '../services/neural/euromillions-stars-neural';

const prisma = new PrismaClient();

async function runSplitBackfillLSTM() {
    console.log('🚀 Starting TIERED SPLIT Neural Backfill for LSTM (Quarterly Retraining)...');
    
    // Wipe Old Inflated Scores for LSTM
    await prisma.systemPerformance.deleteMany({
        where: { systemName: 'LSTM Neural Network' }
    });
    await prisma.starSystemPerformance.deleteMany({
        where: { systemName: 'LSTM Neural Network (Estrelas)' }
    });
    
    const game = 'EUROMILLIONS';

    console.log(`\n========================================`);
    console.log(`🎲 Analyzing Game (Split-Forward Train/Test): ${game}`);
    console.log(`========================================`);

    const allDraws = await prisma.draw.findMany({
        where: { game },
        orderBy: { date: 'asc' } // Oldest first
    });

    // Test ~1.5 years (156 draws)
    const maxDrawsToTest = 150; 
    if (allDraws.length < maxDrawsToTest + 50) return;

    // STRIDE size: 25 draws = ~3 Months (Quarterly Validation)
    // NOTE: For LSTM, we could stride every 50 to save time, but to keep it mathematically equivalent, we use 25.
    const STRIDE_QUARTER = 25;

    // 1. LSTM NUMBERS
    const lstmSystem = new LSTMSystem('numbers', 50);
    await runStridedBatchLSTM(lstmSystem, 'LSTM Neural Network', allDraws, 'numbers', 50, game, maxDrawsToTest, STRIDE_QUARTER);
    
    // 2. LSTM STARS
    const lstmSystemStars = new LSTMSystem('stars', 12);
    await runStridedBatchLSTM(lstmSystemStars, 'LSTM Neural Network (Estrelas)', allDraws, 'stars', 12, game, maxDrawsToTest, STRIDE_QUARTER);
}

async function runStridedBatchLSTM(
    systemInstance: any, 
    systemName: string, 
    allDraws: any[], 
    domain: 'numbers' | 'stars', 
    maxVal: number, 
    game: string,
    totalDrawsToTest: number,
    stride: number
) {
    // Register Keys Safely
    await prisma.rankedSystem.upsert({
        where: { name_game: { name: systemName, game: game } },
        update: { isActive: true },
        create: { name: systemName, game: game, description: `Auto-registered via ML Split LSTM`, systemType: 'NEURAL', domain: domain === 'numbers' ? 'NUMBERS' : 'STARS', isActive: true }
    });

    console.log(`\n[Strided Validation] Quarterly Evaluation for ${systemName}...`);

    let totalHits = 0;
    const startIndex = allDraws.length - totalDrawsToTest;

    for (let chunkStartOffset = startIndex; chunkStartOffset < allDraws.length; chunkStartOffset += stride) {
        
        // 1. TRAIN ONCE per Quarter (Model never sees the chunk's target draws)
        const historyForTraining = allDraws.slice(0, chunkStartOffset);
        
        const anchorDate = new Date(historyForTraining[historyForTraining.length - 1].date).toISOString().split('T')[0];
        console.log(`\n -> 🧠 Retraining Deep LSTM Brain (Pre-Chunk Knowledge Frozen at: ${anchorDate})`);
        
        try {
            if (domain === 'numbers') {
                await trainEuromillionsNumbers({ customHistory: historyForTraining });
            } else {
                await trainEuromillionsStars({ customHistory: historyForTraining });
            }
        } catch (e) {
            console.error(`Error training LSTM at ${anchorDate}:`, e);
        }
        
        // 2. EVALUATE out-of-sample block sequentially (Using Frozen Brain)
        const chunkEndOffset = Math.min(chunkStartOffset + stride, allDraws.length);
        const drawsInThisQuarter = allDraws.slice(chunkStartOffset, chunkEndOffset);
        
        let chunkHits = 0;
        
        for (let i = 0; i < drawsInThisQuarter.length; i++) {
            const targetDraw = drawsInThisQuarter[i];
            
            // Reconstruct the exact history up to this specific draw
            const exactHistoryAtT = allDraws.slice(0, chunkStartOffset + i);
            
            // Fast Inference
            const pred = await systemInstance.predict(exactHistoryAtT);
            
            // For backfill, we must simulate the Top 25 (margin simulation) just like Random Forest does to find secondary hits.
            // Actually, the user asked for LSTM accuracy. Let's slice it to the limit.
            const limit = domain === 'numbers' ? 25 : 6;
            const predLimited = pred.numbers.slice(0, limit);
            
            let hits = 0;
            const actualArr = domain === 'numbers' ? JSON.parse(targetDraw.numbers) : JSON.parse(targetDraw.stars);
            
            predLimited.forEach((n: number) => {
                if (actualArr.includes(n)) hits++;
            });
            
            chunkHits += hits;

            // Commit Iteration directly to Prisma
            if (domain === 'numbers') {
                await prisma.systemPerformance.upsert({
                    where: { id: targetDraw.id * 1000 + 300 }, // Unique dummy ID logic for simplicity, or just create it
                    update: {},
                    create: {
                        drawId: targetDraw.id,
                        systemName: systemName,
                        predictedNumbers: JSON.stringify(predLimited),
                        actualNumbers: JSON.stringify(actualArr),
                        hits: hits,
                        score: hits * 10,
                        accuracy: (hits / 5) * 100
                    }
                }).catch(async () => {
                   await prisma.systemPerformance.create({
                        data: { drawId: targetDraw.id, systemName, predictedNumbers: JSON.stringify(predLimited), actualNumbers: JSON.stringify(actualArr), hits, score: hits * 10, accuracy: (hits / 5) * 100}
                   });
                });
            } else {
                await prisma.starSystemPerformance.upsert({
                    where: { id: targetDraw.id * 1000 + 400 },
                    update: {},
                    create: {
                        drawId: targetDraw.id,
                        systemName: systemName,
                        predictedStars: JSON.stringify(predLimited),
                        actualStars: JSON.stringify(actualArr),
                        hits: hits,
                        score: hits * 15,
                        accuracy: (hits / 2) * 100
                    }
                }).catch(async () => {
                   await prisma.starSystemPerformance.create({
                        data: { drawId: targetDraw.id, systemName, predictedStars: JSON.stringify(predLimited), actualStars: JSON.stringify(actualArr), hits, score: hits * 15, accuracy: (hits / 2) * 100}
                   });
                });
            }
        }
        
        totalHits += chunkHits;
        console.log(`    ✅ Quarter validated. Chunk Hits: ${chunkHits}.`);
    }

    console.log(`\n🎯 FINAL RESULT FOR ${systemName}: Total Hits in 150 Draws = ${totalHits}`);
}

runSplitBackfillLSTM()
    .then(() => {
        console.log('\n🚀 LSTM TIERED BACKFILL COMPLETE!');
        process.exit(0);
    })
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });
