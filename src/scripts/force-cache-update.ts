
import { prisma } from '../lib/prisma';
import { rankedSystems } from '../services/ranked-systems';

async function forceCacheUpdate() {
    console.log('⚡ Starting FLASH Cache Update...');

    // 1. Get History
    const history = await prisma.draw.findMany({
        orderBy: { date: 'desc' }
    });
    console.log(`📚 History loaded: ${history.length} draws`);

    // 2. Identify Missing
    const cached = await prisma.cachedPrediction.findMany({
        select: { systemName: true }
    });
    const cachedNames = cached.map(c => c.systemName);

    const missingSystems = rankedSystems.filter(s => !cachedNames.includes(s.name));

    if (missingSystems.length === 0) {
        console.log('✅ Nothing to update. All systems cached.');
        return;
    }

    console.log(`🛠️  Updating ${missingSystems.length} missing systems...`);

    // 3. Update Only Missing
    for (const system of missingSystems) {
        try {
            process.stdout.write(`Processing ${system.name}... `);
            const start = performance.now();

            const prediction = await system.generateTop10(history);

            // Calculate Worst 25
            const allNumbers = Array.from({ length: 50 }, (_, i) => i + 1);
            const worstNumbers = allNumbers.filter(n => !prediction.includes(n));

            await prisma.cachedPrediction.create({
                data: {
                    systemName: system.name,
                    numbers: JSON.stringify(prediction),
                    worstNumbers: JSON.stringify(worstNumbers)
                }
            });

            const end = performance.now();
            console.log(`✅ Done in ${(end - start).toFixed(0)}ms`);
        } catch (error) {
            console.log(`❌ Failed: ${error}`);
        }
    }

    console.log('\n✨ FLASH Update Complete!');
}

forceCacheUpdate()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
