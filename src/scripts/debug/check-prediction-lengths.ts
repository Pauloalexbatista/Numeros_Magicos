
import { prisma } from '../../lib/prisma';

async function checkLengths() {
    console.log('🔍 Checking Prediction Lengths...');

    const systems = await prisma.rankedSystem.findMany({
        where: { isActive: true, domain: 'NUMBERS' } // Only number systems
    });

    const boosters = await prisma.cachedPrediction.findMany({
        where: { systemName: { in: systems.map(s => s.name) } }
    });

    console.log(`Found ${systems.length} active systems.`);
    console.log(`Found ${boosters.length} cached predictions.`);

    let issues = 0;

    for (const sys of systems) {
        const cache = boosters.find(b => b.systemName === sys.name);

        if (!cache) {
            console.log(`❌ ${sys.name} (${sys.game}): NO CACHE`);
            issues++;
            continue;
        }

        let numbers: number[] = [];
        try {
            numbers = typeof cache.numbers === 'string' ? JSON.parse(cache.numbers) : cache.numbers;
        } catch (e) {
            console.log(`❌ ${sys.name}: Invalid JSON`);
            continue;
        }

        const required = sys.game === 'EURODREAMS' ? 20 : 25;

        if (numbers.length < required) {
            console.log(`⚠️  ${sys.name} (${sys.game}): ${numbers.length} numbers (Required: ${required})`);
            console.log(`    Numbers: ${numbers.join(', ')}`);
            issues++;
        }
    }

    if (issues === 0) {
        console.log('✅ All systems have correct prediction counts.');
    } else {
        console.log(`❌ Found ${issues} systems with issues.`);
    }
}

checkLengths()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
