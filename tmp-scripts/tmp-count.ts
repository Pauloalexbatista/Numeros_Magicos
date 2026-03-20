import { prisma } from './src/lib/prisma';

async function countSystems() {
    const systems = await prisma.rankedSystem.findMany({
        select: {
            game: true,
            domain: true,
            isActive: true,
            name: true,
            systemType: true
        }
    });

    const counts: Record<string, any> = {};

    for (const sys of systems) {
        if (!counts[sys.game]) {
            counts[sys.game] = { NUMBERS: 0, STARS: 0, TOTAL: 0, names: { NUMBERS: [], STARS: [] } };
        }
        counts[sys.game][sys.domain]++;
        counts[sys.game].TOTAL++;
        counts[sys.game].names[sys.domain].push(`${sys.name} (${sys.systemType})`);
    }

    console.log(JSON.stringify(counts, null, 2));

    await prisma.$disconnect();
}

countSystems().catch(console.error);
