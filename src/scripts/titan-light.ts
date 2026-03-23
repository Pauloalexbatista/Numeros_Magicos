import { PrismaClient } from '@prisma/client';
import { MLClassifierSystem } from '../systems/ml/MLClassifierSystem';
import { trainMLClassifierModel } from '../services/neural/classifier-train-core';

const prisma = new PrismaClient();

export async function runTitanLight() {
    console.log('🚀 INICIANDO O "MOTOR TITAN LIGHT" - BACKTEST EXCLUSIVO PARA O ML CLASSIFIER...');
    console.log('⚠️ Processamento isolado na máquina LOCAL para máxima velocidade e 0% impacto na VPS.');
    
    const games = ['EUROMILLIONS', 'EURODREAMS', 'TOTOLOTO'];

    for (const game of games) {
        console.log(`\n========================================`);
        console.log(`🎲 Analyzing Game (TITAN LIGHT): ${game}`);
        console.log(`========================================`);

        const allDraws = await prisma.draw.findMany({
            where: { game },
            orderBy: { date: 'asc' }
        });

        const START_OFFSET = 100;

        if (allDraws.length < START_OFFSET + 10) {
            console.log(`Pouco histórico para ${game}. A saltar.`);
            continue;
        }

        const maxVal = game === 'EUROMILLIONS' ? 50 : (game === 'TOTOLOTO' ? 49 : 40);
        const maxStar = game === 'EUROMILLIONS' ? 12 : (game === 'TOTOLOTO' ? 13 : 5);

        // ML Classifier (Números)
        await runResumablePurist('ML Classifier', allDraws, 'numbers', maxVal, game, START_OFFSET);

        // ML Classifier (Estrelas)
        await runResumablePurist('ML Classifier (Estrelas)', allDraws, 'stars', maxStar, game, START_OFFSET);
    }
}

async function runResumablePurist(
    systemName: string, 
    allDraws: any[], 
    domain: 'numbers' | 'stars', 
    maxVal: number, 
    game: string,
    startOffset: number
) {
    await prisma.rankedSystem.upsert({
        where: { name_game: { name: systemName, game: game } },
        update: { }, // Apenas não forçar true caso o utilizador já tenha ativado
        create: { name: systemName, game: game, description: `Titan Light Registered`, systemType: 'NEURAL', domain: domain === 'numbers' ? 'NUMBERS' : 'STARS', isActive: false, priority: 10 }
    });

    const totalToTest = allDraws.length - startOffset;
    let lastProcessedDrawId = 0;
    
    if (domain === 'stars') {
        const lastPerf = await prisma.starSystemPerformance.findFirst({
            where: { systemName, game },
            orderBy: { draw: { date: 'desc' } },
            include: { draw: true }
        });
        if (lastPerf) lastProcessedDrawId = lastPerf.drawId;
    } else {
        const lastPerf = await prisma.systemPerformance.findFirst({
            where: { systemName, game },
            orderBy: { draw: { date: 'desc' } },
            include: { draw: true }
        });
        if (lastPerf) lastProcessedDrawId = lastPerf.drawId;
    }

    let startIdx = startOffset;
    if (lastProcessedDrawId > 0) {
        const foundIdx = allDraws.findIndex(d => d.id === lastProcessedDrawId);
        if (foundIdx !== -1) {
            startIdx = foundIdx + 1;
            console.log(`[RESUMO] 🔄 Encontrado histórico. Retomando no sorteio ${startIdx} de ${allDraws.length}...`);
        }
    }

    if (startIdx >= allDraws.length) {
        console.log(`✅ ${systemName} já está 100% calculado até à data atual!`);
        return;
    }

    console.log(`Iniciando cálculos... (restam ${allDraws.length - startIdx} sorteios)`);
    
    for (let i = startIdx; i < allDraws.length; i++) {
        const targetDraw = allDraws[i];
        const historyContext = allDraws.slice(0, i); 
        
        try {
            const modelDbKey = `CLASSIFIER_${game}_${domain === 'stars' ? (game === 'EURODREAMS' ? 'DREAMS' : 'STARS') : 'NUMBERS'}`;
            await trainMLClassifierModel(game, domain === 'stars', maxVal, modelDbKey, historyContext);

            let rawArray: number[] = [];
            const dbRow = await prisma.mLModelTraining.findUnique({ where: { modelType: modelDbKey } });
            if (dbRow && dbRow.modelData) {
                try {
                    const parsed = JSON.parse(dbRow.modelData);
                    if (parsed.nextPrediction && parsed.nextPrediction.length > 0) rawArray = parsed.nextPrediction;
                } catch (e) { }
            }
            if (rawArray.length === 0) rawArray = Array.from({length: 10}, (_, j) => j + 1); 

            let prediction: number[] = [];
            let maxHitsPossible = 5;

            if (domain === 'stars') {
                const limit = game === 'EUROMILLIONS' ? 6 : (game === 'TOTOLOTO' ? 5 : 3);
                prediction = rawArray.slice(0, limit);
                maxHitsPossible = game === 'EUROMILLIONS' ? 2 : 1;
            } else {
                const limit = game === 'EURODREAMS' ? 10 : 10; 
                prediction = rawArray.slice(0, limit);
                maxHitsPossible = game === 'EURODREAMS' ? 6 : 5;
            }

            const actual = JSON.parse(targetDraw[domain]);
            const hits = actual.filter((n: number) => prediction.includes(n)).length;
            const accuracy = (hits / maxHitsPossible) * 100;
            
            if (domain === 'stars') {
                await prisma.starSystemPerformance.upsert({
                    where: { drawId_systemName_game: { drawId: targetDraw.id, systemName: systemName, game: game } },
                    update: { predictedStars: JSON.stringify(prediction), actualStars: targetDraw[domain], hits: hits },
                    create: { drawId: targetDraw.id, game: game, systemName: systemName, predictedStars: JSON.stringify(prediction), actualStars: targetDraw[domain], hits: hits, createdAt: new Date(targetDraw.date) }
                });
            } else {
                await prisma.systemPerformance.upsert({
                    where: { drawId_systemName_game: { drawId: targetDraw.id, systemName: systemName, game: game } },
                    update: { predictedNumbers: JSON.stringify(prediction), actualNumbers: targetDraw[domain], hits: hits, accuracy: accuracy },
                    create: { drawId: targetDraw.id, game: game, systemName: systemName, predictedNumbers: JSON.stringify(prediction), actualNumbers: targetDraw[domain], hits: hits, accuracy: accuracy, createdAt: new Date(targetDraw.date) }
                });
            }

            const pctDone = (((i - startOffset) / totalToTest) * 100).toFixed(2);
            process.stdout.write(`\r[${pctDone}%] Sorteio: ${targetDraw.date.toISOString().split('T')[0]} | Acertos: ${hits} `);

            // Report progress to DB every 10 draws for UI visibility
            if (i % 10 === 0) {
                await prisma.statisticsCache.upsert({
                    where: { key: 'TITAN_PROGRESS' },
                    update: { data: JSON.stringify({ game, domain, currentDate: targetDraw.date, pct: pctDone, isRunning: true }) },
                    create: { key: 'TITAN_PROGRESS', data: JSON.stringify({ game, domain, currentDate: targetDraw.date, pct: pctDone, isRunning: true }) }
                });
            }

        } catch (e) {
            console.error(`\n❌ Falha catastrófica no sorteio ${targetDraw.date}:`, e);
            process.exit(1);
        }
    }
    
    // Clear progress at the end
    await prisma.statisticsCache.upsert({
        where: { key: 'TITAN_PROGRESS' },
        update: { data: JSON.stringify({ isRunning: false }) },
        create: { key: 'TITAN_PROGRESS', data: JSON.stringify({ isRunning: false }) }
    });
}

// runTitanLight().then(() => console.log('\n✅ TRABALHO TITAN 100% CONCLUÍDO!')).catch(console.error).finally(() => prisma.$disconnect());
