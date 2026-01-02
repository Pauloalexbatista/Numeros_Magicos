
import { prisma } from '../lib/prisma';

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

    console.log(`Checking systems for Draw: ${targetDate} (ID: ${draw.id})`);

    // 2. Get all ACTIVE systems
    const allSystems = await prisma.rankedSystem.findMany({
        where: { isActive: true },
        select: { name: true }
    });
    const allNames = new Set(allSystems.map(s => s.name));
    console.log(`Total Active Systems: ${allNames.size}`);

    // 3. Get systems that HAVE data for this draw
    const performances = await prisma.systemPerformance.findMany({
        where: { drawId: draw.id },
        select: { systemName: true }
    });
    const presentNames = new Set(performances.map(p => p.systemName));
    console.log(`Systems with performance data: ${presentNames.size}`);

    // 4. Calculate Missing
    const missing: string[] = [];
    for (const name of allNames) {
        if (!presentNames.has(name)) {
            missing.push(name);
        }
    }

    if (missing.length === 0) {
        console.log("\n✅ ALL ACTIVE SYSTEMS ARE UPDATED!");
    } else {
        console.log(`\n⚠️  The following ${missing.length} systems are MISSING data for ${targetDate}:`);
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
