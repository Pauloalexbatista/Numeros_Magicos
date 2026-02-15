
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkPredictionSize() {
    console.log('Checking Prediction Size for Clustering Stars (2026)...');

    const perfs = await prisma.starSystemPerformance.findMany({
        where: {
            systemName: 'Clustering Stars',
            draw: {
                // game: 'EUROMILLIONS', // Clustering Stars is EM
                date: { gte: new Date('2026-01-01') }
            }
        },
        select: {
            predictedStars: true,
            draw: { select: { date: true } }
        },
        take: 5
    });

    perfs.forEach(p => {
        const stars = JSON.parse(p.predictedStars);
        console.log(`Draw ${p.draw.date.toISOString().split('T')[0]}: Predicted ${stars.length} stars: [${stars.join(', ')}]`);
    });
}

checkPredictionSize()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
