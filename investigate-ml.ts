import { prisma } from './src/lib/prisma';

async function investigateML() {
    console.log('🔍 INVESTIGAÇÃO DO SISTEMA ML\n');

    // PASSO 1: Verificar Draws
    const drawCount = await prisma.draw.count();
    console.log(`✅ PASSO 1 - Draws: ${drawCount}`);

    // PASSO 2: Verificar SystemPrediction para ML
    const mlPredictions = await prisma.systemPrediction.count({
        where: { systemName: 'Machine Learning (Regressão Logística)' }
    });
    console.log(`${mlPredictions > 0 ? '✅' : '❌'} PASSO 2 - ML Predictions: ${mlPredictions}`);

    // PASSO 2b: Verificar Anti-ML
    const antiMLPredictions = await prisma.systemPrediction.count({
        where: { systemName: 'Anti-Machine Learning (Regressão Logística)' }
    });
    console.log(`${antiMLPredictions > 0 ? '✅' : '❌'} PASSO 2b - Anti-ML Predictions: ${antiMLPredictions}`);

    // PASSO 3: Verificar SystemRanking
    const mlRanking = await prisma.systemRanking.findUnique({
        where: { systemName: 'Machine Learning (Regressão Logística)' }
    });
    console.log(`${mlRanking ? '✅' : '❌'} PASSO 3 - ML Ranking:`, mlRanking);

    // PASSO 4: Ver uma amostra de SystemPrediction
    console.log('\n📊 AMOSTRA - Outros sistemas:');
    const sample = await prisma.systemPrediction.groupBy({
        by: ['systemName'],
        _count: { systemName: true }
    });

    sample.slice(0, 5).forEach(s => {
        console.log(`  ${s.systemName}: ${s._count.systemName} previsões`);
    });

    await prisma.$disconnect();
}

investigateML();
