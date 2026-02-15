
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearCache() {
    console.log('Clearing Cached Prediction for Clustering Stars...');
    await prisma.cachedPrediction.deleteMany({
        where: {
            systemName: 'Clustering Stars'
        }
    });
    console.log('Cache cleared.');
}

clearCache()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
