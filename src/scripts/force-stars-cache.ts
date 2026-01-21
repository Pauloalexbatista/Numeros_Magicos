import { prisma } from '../lib/prisma';
import { starSystems } from '../services/star-systems';

async function main() {
    console.log('🌟 Forcing Star Cache Update...');

    // Get full history
    const history = await prisma.draw.findMany({
        orderBy: { date: 'desc' }
    });
    console.log(`Loaded ${history.length} draws.`);
    const allStars = Array.from({ length: 12 }, (_, i) => i + 1);

    for (const system of starSystems) {
        console.log(`Processing ${system.name}...`);
        try {
            const prediction = await system.generatePrediction(history);
            // Handle promise if needed (some are async)
            const resolvedPred = Array.isArray(prediction) ? prediction : await prediction;

            const topStars = Array.from(new Set(resolvedPred));
            const worstStars = allStars.filter(n => !topStars.includes(n));

            await prisma.cachedPrediction.upsert({
                where: { systemName: system.name },
                update: {
                    numbers: JSON.stringify(topStars),
                    worstNumbers: JSON.stringify(worstStars),
                    updatedAt: new Date()
                },
                create: {
                    systemName: system.name,
                    numbers: JSON.stringify(topStars),
                    worstNumbers: JSON.stringify(worstStars)
                }
            });
            console.log(`✅ Cached ${system.name}`);
        } catch (e) {
            console.error(`❌ Failed ${system.name}:`, e);
        }
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
