
import { prisma } from '@/lib/prisma';

async function main() {
    const prediction = await prisma.cachedPrediction.findUnique({
        where: { systemName: 'LSTM Neural Net' }
    });

    console.log('Prediction for LSTM Neural Net:');
    if (prediction) {
        console.log(JSON.stringify(prediction, null, 2));
        const numbers = JSON.parse(prediction.numbers);
        console.log(`Number count: ${numbers.length}`);
    } else {
        console.log('No prediction found.');
    }
}

main();
