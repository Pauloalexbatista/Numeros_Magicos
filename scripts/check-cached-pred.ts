
import { PrismaClient } from '@prisma/client';
import { getStarPrediction } from '../src/app/analysis/stars/actions';

const prisma = new PrismaClient();

async function checkCachedPred() {
    console.log('Fetching Prediction for Clustering Stars...');
    // This calls the action which will regenerate the cache if missing
    const prediction = await getStarPrediction('Clustering Stars');
    console.log(`Prediction: ${prediction.length} stars: [${prediction.join(', ')}]`);
}

checkCachedPred()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
