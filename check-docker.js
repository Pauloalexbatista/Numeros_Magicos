const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    const draws = await prisma.draw.count();
    const ml = await prisma.systemPrediction.count({
        where: { systemName: 'Machine Learning (Regressão Logística)' }
    });
    const lstm = await prisma.systemPrediction.count({
        where: { systemName: 'LSTM Neural Net' }
    });

    console.log('Draws:', draws);
    console.log('ML Predictions:', ml);
    console.log('LSTM Predictions:', lstm);

    await prisma.$disconnect();
}

check();
