import { prisma } from '../lib/prisma';
import { starSystems } from '../services/star-systems';

async function regenerateStarCache() {
    console.log('🌟 Regenerating Star Prediction Cache...');

    // Get all draws (newest first)
    const draws = await prisma.draw.findMany({
        orderBy: { date: 'desc' }
    });

    console.log(`📚 Loaded ${draws.length} draws`);

    for (const system of starSystems) {
        try {
            console.log(`\n🔄 ${system.name}...`);

            // Generate new prediction (6 stars)
            const prediction = await system.generatePrediction(draws);
            const sortedPrediction = prediction.sort((a, b) => a - b);

            console.log(`   Predicted: [${sortedPrediction.join(', ')}]`);

            // Calculate worst stars
            const allStars = Array.from({ length: 12 }, (_, i) => i + 1);
            const worstStars = allStars.filter(s => !sortedPrediction.includes(s));

            // Update cache
            await prisma.cachedPrediction.upsert({
                where: { systemName: system.name },
                update: {
                    numbers: JSON.stringify(sortedPrediction),
                    worstNumbers: JSON.stringify(worstStars),
                    updatedAt: new Date()
                },
                create: {
                    systemName: system.name,
                    numbers: JSON.stringify(sortedPrediction),
                    worstNumbers: JSON.stringify(worstStars)
                }
            });

            console.log(`   ✅ Cache updated`);

        } catch (error) {
            console.error(`   ❌ Failed:`, error);
        }
    }

    console.log('\n✨ Star cache regeneration complete!');
}

regenerateStarCache()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
