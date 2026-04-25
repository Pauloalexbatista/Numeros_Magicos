import { prisma } from '../../lib/prisma';
import { buildAllFeatures } from '../../services/neural/feature-extractor';
import { RandomForestSystem } from '../../systems/ml/RandomForestSystem';
import { DecisionTreeClassifier } from 'ml-cart';

async function sequentialBacktest(gameName: string, isStars: boolean, limit: number = 50) {
    console.log(`\n🚀 [BACKTEST] Iniciando teste sequencial: ${gameName} (${isStars ? 'Estrelas' : 'Números'})`);
    
    const targetField = isStars ? 'stars' : 'numbers';
    const systemName = isStars ? 'Random Forest (Estrelas)' : 'Random Forest (Números)';

    let maxVal = 50;
    if (gameName === 'TOTOLOTO') maxVal = isStars ? 13 : 49;
    else if (gameName === 'EURODREAMS') maxVal = isStars ? 5 : 40;
    else if (gameName === 'EUROMILLIONS') maxVal = isStars ? 12 : 50;

    // 1. Ensure system in DB
    await prisma.rankedSystem.upsert({
        where: { name_game: { name: systemName, game: gameName } },
        update: { systemType: 'NEURAL', domain: isStars ? 'STARS' : 'NUMBERS' },
        create: {
            name: systemName,
            game: gameName,
            systemType: 'NEURAL',
            domain: isStars ? 'STARS' : 'NUMBERS',
            isActive: true
        }
    });

    const allDraws = await prisma.draw.findMany({
        where: { game: gameName },
        orderBy: { date: 'asc' }
    });

    if (allDraws.length < 100) return;

    // 2. Pre-calculate ALL features
    console.log(`   ⚙️  Calculando matriz de características...`);
    const allExtracted = buildAllFeatures(allDraws, maxVal, targetField);
    
    let totalHits = 0;
    let processed = 0;

    for (let i = 0; i < limit; i++) {
        const targetDrawIdx = allDraws.length - limit + i;
        const targetDraw = allDraws[targetDrawIdx];
        
        // Window index in allExtracted
        const rowsToTakeEnd = (targetDrawIdx - 50) * maxVal;
        // Use a window of 400 draws for training (400 * maxVal rows)
        const windowSizeRows = 400 * maxVal;
        const rowsToTakeStart = Math.max(0, rowsToTakeEnd - windowSizeRows);
        
        const trainFeatures = allExtracted.features.slice(rowsToTakeStart, rowsToTakeEnd);
        const trainLabels = allExtracted.labels.slice(rowsToTakeStart, rowsToTakeEnd);

        if (trainFeatures.length === 0) continue;

        // 3. Train
        const classifier = new DecisionTreeClassifier({ maxDepth: 12, minNumSamples: 5 });
        classifier.train(trainFeatures, trainLabels);

        // 4. Predict
        const historyUpToTarget = allDraws.slice(0, targetDrawIdx);
        const system = new RandomForestSystem(targetField, maxVal);
        const prediction = await system.generateTop25(historyUpToTarget, targetField, maxVal, classifier);

        // 5. Audit
        const actualNumbers = typeof targetDraw[targetField] === 'string' 
            ? JSON.parse(targetDraw[targetField] as string) 
            : targetDraw[targetField] as number[];
        
        const hits = prediction.filter(n => actualNumbers.includes(n)).length;
        const accuracy = hits / (isStars ? actualNumbers.length : 5);

        await prisma.systemPerformance.upsert({
            where: {
                drawId_systemName_game: {
                    drawId: targetDraw.id,
                    systemName,
                    game: gameName
                }
            },
            update: { hits, accuracy, predictedNumbers: JSON.stringify(prediction), actualNumbers: JSON.stringify(actualNumbers) },
            create: { drawId: targetDraw.id, systemName, game: gameName, hits, accuracy, predictedNumbers: JSON.stringify(prediction), actualNumbers: JSON.stringify(actualNumbers) }
        });

        totalHits += hits;
        processed++;

        if (processed % 25 === 0 || processed === limit) {
            console.log(`   ✅ [${gameName}] Processados ${processed}/${limit}... (Hits: ${hits})`);
        }
    }
}

async function runAll() {
    try {
        const limit = 50;
        await sequentialBacktest('EUROMILLIONS', false, limit);
        await sequentialBacktest('EUROMILLIONS', true, limit);
        await sequentialBacktest('TOTOLOTO', false, limit);
        await sequentialBacktest('TOTOLOTO', true, limit);
        await sequentialBacktest('EURODREAMS', false, limit);
        await sequentialBacktest('EURODREAMS', true, limit);
        console.log('\n✅ [FULL BACKTEST COMPLETO] Todos os jogos processados.');
    } catch (error) {
        console.error('❌ Erro durante o backtest:', error);
    } finally {
        await prisma.$disconnect();
    }
}

runAll();
