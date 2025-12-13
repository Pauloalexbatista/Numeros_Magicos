import { prisma } from './src/lib/prisma';

async function investigateOtherSystem() {
    console.log('🔍 INVESTIGAÇÃO - LSTM Neural Net\n');

    // Verificar Draws
    const drawCount = await prisma.draw.count();
    console.log(`Draws: ${drawCount}`);

    // Verificar LSTM
    const lstmPredictions = await prisma.systemPrediction.count({
        where: { systemName: 'LSTM Neural Net' }
    });
    console.log(`LSTM Predictions: ${lstmPredictions}`);

    // Verificar ML
    const mlPredictions = await prisma.systemPrediction.count({
        where: { systemName: 'Machine Learning (Regressão Logística)' }
    });
    console.log(`ML Predictions: ${mlPredictions}`);

    // Listar todos os sistemas
    console.log('\n📊 TODOS OS SISTEMAS:');
    const allSystems = await prisma.systemPrediction.groupBy({
        by: ['systemName'],
        _count: { systemName: true }
    });

    allSystems.forEach(s => {
        console.log(`  ${s.systemName}: ${s._count.systemName}`);
    });

    await prisma.$disconnect();
}

investigateOtherSystem();
