import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

async function main() {
    console.log("--- EuroDreams NUMBERS Systems ---");
    const edNumbers = await prisma.rankedSystem.findMany({
        where: { game: 'EURODREAMS', domain: 'NUMBERS' },
        orderBy: { name: 'asc' }
    });
    edNumbers.forEach(s => console.log(`- ${s.name} (Active: ${s.isActive})`));

    console.log("\n--- EuroDreams STARS Systems (RankedSystem) ---");
    const edStars = await prisma.rankedSystem.findMany({
        where: { game: 'EURODREAMS', domain: 'STARS' },
        orderBy: { name: 'asc' }
    });
    edStars.forEach(s => console.log(`- ${s.name} (Active: ${s.isActive})`));

    console.log("\n--- EuroDreams StarSystemRanking ---");
    const edStarsRanking = await prisma.starSystemRanking.findMany({
        where: { game: 'EURODREAMS' },
        orderBy: { systemName: 'asc' }
    });
    edStarsRanking.forEach(s => console.log(`- ${s.systemName} (Hits: ${s.totalHits})`));

    // Looking for duplicates
    console.log("\n--- Checking for duplicates in RankedSystem ---");
    const allSystems = await prisma.rankedSystem.findMany({ where: { game: 'EURODREAMS' } });
    const counts: Record<string, number> = {};
    for (const sys of allSystems) {
        counts[sys.name] = (counts[sys.name] || 0) + 1;
        if (counts[sys.name] > 1) {
            console.log(`DUPLICATE FOUND: ${sys.name}`);
        }
    }
}
main().finally(() => prisma.$disconnect());
