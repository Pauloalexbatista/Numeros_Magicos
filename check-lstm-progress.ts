/**
 * VERIFICAR PROGRESSO LSTM
 * Conta quantas predições LSTM já foram guardadas
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkProgress() {
    console.log('📊 VERIFICANDO PROGRESSO LSTM...\n');

    const lstmPredictions = await prisma.systemPrediction.count({
        where: { systemName: 'LSTM Neural Net' }
    });

    const lstmPerformance = await prisma.systemPerformance.count({
        where: { systemName: 'LSTM Neural Net' }
    });

    const totalDraws = await prisma.draw.count();

    console.log(`✅ Predições LSTM: ${lstmPredictions}`);
    console.log(`✅ Performance LSTM: ${lstmPerformance}`);
    console.log(`📊 Total de sorteios: ${totalDraws}`);
    console.log(`📈 Progresso: ${((lstmPredictions / totalDraws) * 100).toFixed(1)}%`);

    await prisma.$disconnect();
}

checkProgress().catch(console.error);
