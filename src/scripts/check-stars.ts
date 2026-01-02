
import { prisma } from '../lib/prisma';
import { starSystems } from '../services/star-systems';

async function main() {
    const targetDate = '2025-12-30';

    // 1. Get the draw info
    const draw = await prisma.draw.findFirst({
        where: { date: new Date(targetDate) }
    });

    if (!draw) {
        console.error(`❌ Draw for ${targetDate} not found!`);
        return;
    }

    console.log(`Checking STAR systems for Draw: ${targetDate} (ID: ${draw.id})`);

    // 2. Get registered star systems
    const expectedStars = starSystems.map(s => s.name);
    console.log(`Expected Star Systems: ${expectedStars.length}`);

    // 3. Get actual performance
    const performances = await prisma.starSystemPerformance.findMany({
        where: { drawId: draw.id },
        select: { systemName: true }
    });
    const presentNames = new Set(performances.map(p => p.systemName));
    console.log(`Present Star Systems: ${presentNames.size}`);

    // 4. Calculate Missing
    const missing: string[] = [];
    for (const name of expectedStars) {
        if (!presentNames.has(name)) {
            missing.push(name);
        }
    }

    if (missing.length === 0) {
        console.log("\n✅ ALL STAR SYSTEMS ARE UPDATED!");
    } else {
        console.log(`\n⚠️  The following ${missing.length} STAR systems are MISSING data for ${targetDate}:`);
        missing.forEach(name => console.log(` - ${name}`));
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
