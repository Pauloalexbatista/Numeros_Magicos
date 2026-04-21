import { PrismaClient } from '@prisma/client';
import { trainRandomForestModel } from '../services/neural/rf-train-core';
import { NeuralPersistenceService } from '../services/neural/persistence';

const prisma = new PrismaClient();

export async function runTitanRF() {
    console.log('🌳 INICIANDO O "MOTOR RF" - BACKTEST EXCLUSIVO PARA RANDOM FOREST...');
    console.log('⚠️ Processamento em background na máquina para calcular o histórico.');
    
    // 🔒 Acquire global lock
    await NeuralPersistenceService.acquireLock('TITAN_RF_GLOBAL', 'multiple');
    
    // 📡 Initial progress report
    await NeuralPersistenceService.reportProgress('RF', 'STARTING', 'INITIALIZING', 0);

    const games = ['EUROMILLIONS', 'EURODREAMS', 'TOTOLOTO'];

    for (const game of games) {
        console.log(`\n========================================`);
        console.log(`🎲 Analyzing Game (TITAN RF): ${game}`);
        console.log(`========================================`);

        const allDraws = await prisma.draw.findMany({
            where: { game },
            orderBy: { date: 'asc' }
        });

        const START_OFFSET = 100; // Precisa de pelo menos 100 sorteios como contexto histórico para iniciar a IA

        if (allDraws.length < START_OFFSET + 10) {
            console.log(`Pouco histórico para ${game}. A saltar.`);
            continue;
        }

        const maxVal = game === 'EUROMILLIONS' ? 50 : (game === 'TOTOLOTO' ? 49 : 40);
        const maxStar = game === 'EUROMILLIONS' ? 12 : (game === 'TOTOLOTO' ? 13 : 5);

        // RF (Números)
        await runResumablePuristRF('Random Forest (Números)', allDraws, 'numbers', maxVal, game, START_OFFSET);

        // RF (Estrelas / Sonhos / Sorte)
        await runResumablePuristRF(`Random Forest (${game === 'EURODREAMS' ? 'Sonhos' : (game === 'TOTOLOTO' ? 'Sorte' : 'Estrelas')})`, allDraws, 'stars', maxStar, game, START_OFFSET);
    }
    
    // 🔓 Release global lock and clear progress
    await NeuralPersistenceService.releaseLock();
    await prisma.statisticsCache.delete({ where: { key: 'RF_PROGRESS' } }).catch(() => {});
}

async function runResumablePuristRF(
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
        create: { name: systemName, game: game, description: `Titan RF Engine`, systemType: 'NEURAL', domain: domain === 'numbers' ? 'NUMBERS' : 'STARS', isActive: false, priority: 11 }
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
            const modelDbKey = `RF_${game}_${domain === 'stars' ? (game === 'EURODREAMS' ? 'DREAMS' : 'STARS') : 'NUMBERS'}`;
            // Train RF for this specific cut in time
            await trainRandomForestModel(game, domain === 'stars', maxVal, modelDbKey, { customHistory: historyContext });

            let rawArray: number[] = [];
            const dbRow = await prisma.mLModelTraining.findUnique({ where: { modelType: modelDbKey } });
            if (dbRow && dbRow.modelData) {
                try {
                    const parsed = JSON.parse(dbRow.modelData);
                    if (parsed.nextPrediction && parsed.nextPrediction.length > 0) Object.values(parsed.nextPrediction).forEach((v: any) => rawArray.push(parseInt(v.toString())));
                } catch (e) { }
            }
            if (rawArray.length === 0) rawArray = Array.from({length: 25}, (_, j) => j + 1); 

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

            const pctDone = parseFloat((((i - startOffset) / totalToTest) * 100).toFixed(2));
            process.stdout.write(`\r[${pctDone}%] RF Sorteio: ${targetDraw.date.toISOString().split('T')[0]} | Acertos: ${hits} `);
 
            // Report progress every 5 draws for UI speed (RF background can be many draws)
            if (i % 5 === 0) {
                await NeuralPersistenceService.reportProgress('RF', game, domain === 'stars' ? 'STARS' : 'NUMBERS', pctDone, targetDraw.date);
            }

            // Libertar a thread do servidor para não crashar a VPS nem bloquear APIs de leitura!
            await new Promise(resolve => setTimeout(resolve, 50));

        } catch (e: any) {
            console.error(`\n❌ Falha catastrófica no sorteio ${targetDraw.date}:`, e);
            await NeuralPersistenceService.reportError('TITAN_RF', e.message || 'Erro no processamento background');
            await NeuralPersistenceService.releaseLock();
            process.exit(1);
        }
    }
}
