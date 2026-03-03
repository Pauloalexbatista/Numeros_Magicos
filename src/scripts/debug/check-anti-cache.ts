
import { prisma } from '../../lib/prisma';

async function checkCache() {
    const antiSystems = await prisma.rankedSystem.findMany({
        where: { name: { startsWith: 'Anti-' }, isActive: true }
    });

    const cached = await prisma.cachedPrediction.findMany({
        where: {
            systemName: { in: antiSystems.map(s => s.name) }
        }
    });

    console.log(`Active Anti-Systems: ${antiSystems.length}`);
    console.log(`Cached Predictions for Anti-Systems: ${cached.length}`);

    if (cached.length < antiSystems.length) {
        console.log('❌ MISSING CACHE FOR:');
        const cachedNames = cached.map(c => c.systemName);
        const missing = antiSystems.filter(s => !cachedNames.includes(s.name));
        missing.forEach(s => console.log(` - ${s.name}`));
    } else {
        console.log('✅ ALL ANTI-SYSTEMS CACHED');
    }
}

checkCache()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
