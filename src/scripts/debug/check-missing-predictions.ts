
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkPredictions() {
    console.log('🔍 Checking Prediction Status...');

    // 1. Get stats for each game
    const games = ['EUROMILLIONS', 'TOTOLOTO', 'EURODREAMS'];

    for (const game of games) {
        console.log(`\n================ ${game} ================`);

        // Get last draw
        const lastDraw = await prisma.draw.findFirst({
            where: { game },
            orderBy: { date: 'desc' }
        });

        if (!lastDraw) {
            console.log('❌ No draws found!');
        } else {
            console.log(`📅 Last Draw: #${lastDraw.drawId} (${lastDraw.date.toISOString().split('T')[0]})`);
        }

        // Get active systems
        const systems = await prisma.rankedSystem.findMany({
            where: { isActive: true, game }
        });

        console.log(`🤖 Active Systems: ${systems.length}`);

        // Check CachedPrediction
        const systemNames = systems.map(s => s.name);
        const allCache = await prisma.cachedPrediction.findMany({
            where: {
                systemName: { in: systemNames }
            }
        });

        console.log(`💾 Total Cached Predictions: ${allCache.length}`);

        // Find missing
        // We check if a cache entry exists for the system name
        const missingSystems = systems.filter(s => !allCache.find(c => c.systemName === s.name));

        if (missingSystems.length > 0) {
            console.log(`⚠️  MISSING PREDICTIONS for ${missingSystems.length} systems:`);
            missingSystems.slice(0, 10).forEach(s => console.log(`   - ${s.name}`));
            if (missingSystems.length > 10) console.log(`   ... and ${missingSystems.length - 10} more.`);
        } else {
            console.log('✅ All active systems have cached predictions.');
        }

        // Check specific Anti-Clustering
        const antiSystemName = systems.find(s => s.name.includes('Anti-Clustering'))?.name;
        if (antiSystemName) {
            const cache = allCache.find(c => c.systemName === antiSystemName);
            console.log(`\n🕵️ Specific Check: ${antiSystemName}`);
            if (cache) {
                console.log(`   ✅ Cache Found: ${cache.numbers} (Updated: ${cache.updatedAt.toISOString()})`);
            } else {
                console.log(`   ❌ CACHE MISSING for ${antiSystemName}`);
            }
        }
    }
}

checkPredictions()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
