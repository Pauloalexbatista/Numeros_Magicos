import { PrismaClient } from '@prisma/client';
import { trainEuromillionsNumbers } from '../services/neural/euromillions-numbers-neural';
import { trainEuromillionsStars } from '../services/neural/euromillions-stars-neural';
import { trainEuroDreamsNumbers } from '../services/neural/eurodreams-numbers-neural';
import { trainEuroDreamsDreams } from '../services/neural/eurodreams-dreams-neural';
import { trainTotolotoNumbers } from '../services/neural/totoloto-numbers-neural';
import { trainTotolotoLucky } from '../services/neural/totoloto-lucky-neural';

const prisma = new PrismaClient();

export async function runTitanLSTM() {
    console.log('🧠 INICIANDO O "MOTOR LSTM" - BACKTEST EXCLUSIVO PARA LONG SHORT-TERM MEMORY...');
    console.log('⚠️ Extremamente pesado. Este processamento pode levar dias.');
    
    // Clear dead progress lock first
    await prisma.statisticsCache.upsert({
        where: { key: 'LSTM_PROGRESS' },
        update: { data: JSON.stringify({ isRunning: true, pct: '0.00', currentDate: new Date() }) },
        create: { key: 'LSTM_PROGRESS', data: JSON.stringify({ isRunning: true, pct: '0.00', currentDate: new Date() }) }
    });

    const games = ['EUROMILLIONS', 'EURODREAMS', 'TOTOLOTO'];

    for (const game of games) {
        console.log(`\n========================================`);
        console.log(`🎲 Analyzing Game (TITAN LSTM): ${game}`);
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

        // LSTM (Números)
        await runResumablePuristLSTM('LSTM Números', allDraws, 'numbers', maxVal, game, START_OFFSET);

        let starsName = 'LSTM Estrelas';
        if (game === 'EURODREAMS') starsName = 'LSTM Sonhos (Estrelas)';
        else if (game === 'TOTOLOTO') starsName = 'LSTM Número da Sorte';
        
        // LSTM (Estrelas / Sonhos / Sorte)
        await runResumablePuristLSTM(starsName, allDraws, 'stars', maxStar, game, START_OFFSET);
    }
    
    // Clear progress lock at the end
    await prisma.statisticsCache.upsert({
        where: { key: 'LSTM_PROGRESS' },
        update: { data: JSON.stringify({ isRunning: false }) },
        create: { key: 'LSTM_PROGRESS', data: JSON.stringify({ isRunning: false }) }
    });
}

async function runResumablePuristLSTM(
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
        create: { name: systemName, game: game, description: `Titan LSTM Deep Engine`, systemType: 'NEURAL', domain: domain === 'numbers' ? 'NUMBERS' : 'STARS', isActive: false, priority: 12 }
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
            console.log(`[RESUMO] 🔄 Encontrado histórico. Retomando LSTM no sorteio ${startIdx} de ${allDraws.length}...`);
        }
    }

    // OTIMIZAÇÃO MASSIVA: Saltar anos antigos no Backtest para poupar 6 dias de cálculos na VPS!
    // A rede neural continuará a receber todo o histórico (desde 2004) como treino (historyContext),
    // mas só vai simular e guardar acertos/rankings para sorteios a partir de 2025!
    const cutDate = new Date('2025-01-01');
    const cutIdx = allDraws.findIndex((d: any) => new Date(d.date) >= cutDate);
    if (cutIdx !== -1 && cutIdx > startIdx) {
        console.log(`[FAST-FORWARD] ⏩ Saltando backtest antigo. A iniciar avaliações apenas a partir de 2025...`);
        startIdx = cutIdx;
    }

    if (startIdx >= allDraws.length) {
        console.log(`✅ ${systemName} já está 100% calculado até à data atual!`);
        return;
    }

    console.log(`Iniciando cálculos Deep Learning... (restam ${allDraws.length - startIdx} sorteios)`);
    
    for (let i = startIdx; i < allDraws.length; i++) {
        const targetDraw = allDraws[i];
        const historyContext = allDraws.slice(0, i); 
        
        try {
            let modelDbKey = '';
            
            // Dispatch to the correct service
            if (game === 'EUROMILLIONS') {
                if (domain === 'numbers') { modelDbKey = 'LSTM_NUMBERS'; await trainEuromillionsNumbers(historyContext); }
                else { modelDbKey = 'LSTM_STARS'; await trainEuromillionsStars(historyContext); }
            } else if (game === 'EURODREAMS') {
                if (domain === 'numbers') { modelDbKey = 'LSTM_EURODREAMS_NUMBERS'; await trainEuroDreamsNumbers(historyContext); }
                else { modelDbKey = 'LSTM_EURODREAMS_DREAMS'; await trainEuroDreamsDreams(historyContext); }
            } else if (game === 'TOTOLOTO') {
                if (domain === 'numbers') { modelDbKey = 'LSTM_TOTOLOTO_NUMBERS'; await trainTotolotoNumbers(historyContext); }
                else { modelDbKey = 'LSTM_TOTOLOTO_LUCKY'; await trainTotolotoLucky(historyContext); }
            }

            let rawArray: number[] = [];
            const dbRow = await prisma.mLModelTraining.findUnique({ where: { modelType: modelDbKey } });
            if (dbRow && dbRow.modelData) {
                try {
                    const parsed = JSON.parse(dbRow.modelData);
                    if (parsed.nextPrediction && parsed.nextPrediction.length > 0) Object.values(parsed.nextPrediction).forEach((v: any) => rawArray.push(parseInt(v.toString())));
                } catch (e) { }
            }
            if (rawArray.length === 0) rawArray = Array.from({length: domain === 'stars' ? 3 : 5}, (_, j) => j + 1); 

            let prediction: number[] = rawArray; // LSTM strictly outputs the exact amount limit natively!
            let maxHitsPossible = 5;

            if (domain === 'stars') {
                maxHitsPossible = game === 'EUROMILLIONS' ? 2 : 1;
            } else {
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
            process.stdout.write(`\r[${pctDone}%] LSTM Sorteio: ${targetDraw.date.toISOString().split('T')[0]} | Acertos: ${hits} `);

            // Report progress every 1 draw since LSTM is massively slow, so we need granular progress!
            await prisma.statisticsCache.upsert({
                where: { key: 'LSTM_PROGRESS' },
                update: { data: JSON.stringify({ game, domain, currentDate: targetDraw.date, pct: pctDone, isRunning: true }) },
                create: { key: 'LSTM_PROGRESS', data: JSON.stringify({ game, domain, currentDate: targetDraw.date, pct: pctDone, isRunning: true }) }
            });

            // GATILHO DE PARAGEM EXTERNA: Se houver sinal na BD, para tudo imediatamente para libertar a VPS.
            if (i % 2 === 0) {
                const stopSignal = await prisma.statisticsCache.findUnique({ where: { key: 'NEURAL_STOP_SIGNAL' } });
                if (stopSignal && stopSignal.data === 'STOP') {
                    console.log('🛑 [TITAN] PARAGEM DE EMERGÊNCIA DETETADA. A SAIR...');
                    await prisma.statisticsCache.upsert({
                        where: { key: 'LSTM_PROGRESS' },
                        update: { data: JSON.stringify({ isRunning: false, message: 'Interrompido manualmente.' }) },
                        create: { key: 'LSTM_PROGRESS', data: JSON.stringify({ isRunning: false }) }
                    });
                    process.exit(0); // Exit process to ensure all background training threads die
                }
            }

            // Libertar a thread do servidor para não crashar a VPS nem bloquear APIs de leitura!
            await new Promise(resolve => setTimeout(resolve, 50));

        } catch (e) {
            console.error(`\n❌ Falha catastrófica no sorteio LSTM ${targetDraw.date}:`, e);
            process.exit(1);
        }
    }
}
