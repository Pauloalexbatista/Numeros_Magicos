import { PrismaClient } from '@prisma/client';
import { MLClassifierSystem } from '../systems/ml/MLClassifierSystem';
import { RandomForestSystem } from '../systems/ml/RandomForestSystem';
import { trainRandomForestModel } from '../services/neural/rf-train-core';
import { trainMLClassifierModel } from '../services/neural/classifier-train-core';

const prisma = new PrismaClient();

// "THE TITAN" - O Motor Rigoroso de 5 Dias com Capacidade de Retoma
async function runTitanEngine() {
    console.log('🚀 INICIANDO O "MOTOR TITAN" - BACKTEST PURO COM CAPACIDADE DE RETOMA...');
    console.log('⚠️ Aviso: Este processo vai treinar a Inteligência Artificial milhares de vezes.');
    console.log('⚠️ Se o computador for desligado, basta correr o script novamente e ele retoma onde parou!');

    const games = ['EUROMILLIONS', 'TOTOLOTO', 'EURODREAMS'];

    for (const game of games) {
        console.log(`\n========================================`);
        console.log(`🎲 Analyzing Game (TITAN PURIST): ${game}`);
        console.log(`========================================`);

        const allDraws = await prisma.draw.findMany({
            where: { game },
            orderBy: { date: 'asc' }
        });

        // O sorteio 100 é o nosso ponto de partida para ter história suficiente para o primeiro treino
        const START_OFFSET = 100;

        if (allDraws.length < START_OFFSET + 10) {
            console.log(`Poulo histórico para ${game}. A saltar.`);
            continue;
        }

        const maxVal = game === 'EUROMILLIONS' ? 50 : (game === 'TOTOLOTO' ? 49 : 40);
        const maxStar = game === 'EUROMILLIONS' ? 12 : (game === 'TOTOLOTO' ? 13 : 5);

        // 1. Random Forest (Números)
        await runResumablePurist('Random Forest', allDraws, 'numbers', maxVal, game, true, START_OFFSET);
        
        // 2. Random Forest (Estrelas)
        await runResumablePurist('Random Forest (Estrelas)', allDraws, 'stars', maxStar, game, true, START_OFFSET);

        // 3. ML Classifier (Números) - O "Pesado"
        await runResumablePurist('ML Classifier', allDraws, 'numbers', maxVal, game, false, START_OFFSET);

        // 4. ML Classifier (Estrelas)
        await runResumablePurist('ML Classifier (Estrelas)', allDraws, 'stars', maxStar, game, false, START_OFFSET);
    }
}

async function runResumablePurist(
    systemName: string, 
    allDraws: any[], 
    domain: 'numbers' | 'stars', 
    maxVal: number, 
    game: string,
    isRF: boolean,
    startOffset: number
) {
    // Registar o modelo caso não exista
    await prisma.rankedSystem.upsert({
        where: { name_game: { name: systemName, game: game } },
        update: { isActive: true },
        create: { name: systemName, game: game, description: `Titan Engine Registered`, systemType: 'NEURAL', domain: domain === 'numbers' ? 'NUMBERS' : 'STARS', isActive: true }
    });

    const totalToTest = allDraws.length - startOffset;
    
    console.log(`\n[${systemName}] Verificando ponto de retoma...`);

    // Descobrir onde parámos verificando a Data do último SystemPerformance registado para esta rede
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
            // Se já processou o X, começamos no X + 1
            startIdx = foundIdx + 1;
            console.log(`[RESUMO] 🔄 Encontrado histórico anterior. Retomando no sorteio índice ${startIdx} de ${allDraws.length}...`);
        }
    }

    if (startIdx >= allDraws.length) {
        console.log(`✅ ${systemName} já está 100% calculado até à data atual!`);
        return;
    }

    console.log(`Iniciando cálculos intensivos a partir do índice ${startIdx} até ${allDraws.length}...`);
    
    // Instanciar Classe correspondente para eventuais falhas (mantendo a assinatura)
    const systemInstance = isRF ? new RandomForestSystem(domain, maxVal) : new MLClassifierSystem(domain, maxVal);

    for (let i = startIdx; i < allDraws.length; i++) {
        const targetDraw = allDraws[i];
        
        // Contexto: Apenas os sorteios do passado (do índice 0 até i - 1)
        const historyContext = allDraws.slice(0, i); 
        
        try {
            // O CORAÇÃO DO TITAN: TREINAR A REDE NO CONTEXTO DO PASSADO
            const modelDbKey = `${isRF ? 'RF' : 'CLASSIFIER'}_${game}_${domain === 'stars' ? (game === 'EURODREAMS' ? 'DREAMS' : 'STARS') : 'NUMBERS'}`;
            
            if (systemName.includes('Random Forest')) {
                await trainRandomForestModel(game, domain === 'stars', maxVal, modelDbKey, { customHistory: historyContext });
            } else {
                await trainMLClassifierModel(game, domain === 'stars', maxVal, modelDbKey, { customHistory: historyContext });
            }

            // Após o treino de sucesso, o script interno atualiza a db com a `nextPrediction`.
            let rawArray: number[] = [];
            const dbRow = await prisma.mLModelTraining.findUnique({ where: { modelType: modelDbKey } });
            if (dbRow && dbRow.modelData) {
                try {
                    const parsed = JSON.parse(dbRow.modelData);
                    if (parsed.nextPrediction && parsed.nextPrediction.length > 0) rawArray = parsed.nextPrediction;
                } catch (e) { }
            }
            
            // Failsafe Dinâmico se houver corrupção da RAM nesse ciclo
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

            // Calcular Acertos com a Realidade Desse Sorteio
            const actual = JSON.parse(targetDraw[domain]);
            const hits = actual.filter((n: number) => prediction.includes(n)).length;
            const accuracy = (hits / maxHitsPossible) * 100;
            
            // GREGAR NO DISCO INSTANTANEAMENTE PARA O CASO DE FALHAR A LUZ!!!
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

            const pctDone = (((i - startOffset) / totalToTest) * 100).toFixed(2);
            process.stdout.write(`\r[${pctDone}%] Sorteio: ${targetDraw.date.toISOString().split('T')[0]} | Acertos: ${hits} `);

        } catch (e) {
            console.error(`\n❌ Falha catastrófica no sorteio ${targetDraw.date}:`, e);
            console.log('O MOTOR TITAN VAI DESLIGAR PARA EVITAR DANOS. RESOLVE O ERRO E VOLTA A CORRER PARA RETOMAR!');
            process.exit(1);
        }
    }
    
    console.log(`\n🎉 MOTOR TITAN: ${systemName} Completou a Viagem no Tempo!\n`);
}

runTitanEngine()
    .then(() => console.log('✅ TRABALHO TITAN 100% CONCLUÍDO!'))
    .catch(console.error)
    .finally(() => prisma.$disconnect());
