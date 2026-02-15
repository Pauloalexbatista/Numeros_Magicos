
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkEuroDreamsPerformance() {
    console.log('Checking EuroDreams Performance for 2026...');

    // Get 2026 draws for EuroDreams
    const draws = await prisma.draw.findMany({
        where: {
            game: 'EURODREAMS',
            date: {
                gte: new Date('2026-01-01'),
                lt: new Date('2027-01-01')
            }
        },
        orderBy: { date: 'desc' },
        select: { id: true, date: true, stars: true }
    });

    console.log(`Found ${draws.length} EuroDreams draws in 2026.`);

    if (draws.length === 0) return;

    // Check performance for "Recent Stars (EuroDreams)"
    const systemName = "Recent Stars (EuroDreams)";
    const perfs = await prisma.starSystemPerformance.findMany({
        where: {
            systemName,
            drawId: { in: draws.map(d => d.id) }
        },
        include: { draw: true }
    });

    console.log(`Found ${perfs.length} performance records for ${systemName}.`);

    perfs.forEach(p => {
        const drawStars = JSON.parse(p.draw.stars);
        const predicted = JSON.parse(p.predictedStars);
        console.log(`Date: ${p.draw.date.toISOString().split('T')[0]} | Draw: [${drawStars}] | Pred: [${predicted}] | Hits: ${p.hits} | Jackpot: ${p.isJackpot}`);
    });
}

checkEuroDreamsPerformance()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
