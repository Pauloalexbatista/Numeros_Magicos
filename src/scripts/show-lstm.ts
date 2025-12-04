
import { prisma } from '../lib/prisma';

async function showLSTM() {
    const cached = await prisma.cachedPrediction.findUnique({
        where: { systemName: 'LSTM Neural Net' }
    });
    console.log('LSTM Prediction:', cached?.numbers);
}

showLSTM().finally(() => prisma.$disconnect());
