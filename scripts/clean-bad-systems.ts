import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

async function main() {
    const systemsToDelete = await prisma.rankedSystem.findMany({
        where: {
            OR: [
                { name: { endsWith: '_EURODREAMS' } },
                { name: { endsWith: '_TOTOLOTO' } },
                { name: { endsWith: '(EuroDreams)' } },
                { name: { endsWith: '(Totoloto)' } },
                { name: { endsWith: ' EURD' } },
                { name: { endsWith: ' TTLT' } }
            ]
        }
    });

    console.log(`Found ${systemsToDelete.length} bad systems to delete.`);
    for (const sys of systemsToDelete) {
        console.log(`Deleting: ${sys.name}`);

        await prisma.cachedPrediction.deleteMany({ where: { systemName: sys.name } });
        await prisma.systemPerformance.deleteMany({ where: { systemName: sys.name } });
        await prisma.systemPerformanceStaging.deleteMany({ where: { systemName: sys.name } });
        await prisma.starSystemPerformance.deleteMany({ where: { systemName: sys.name } });
        await prisma.systemRanking.deleteMany({ where: { systemName: sys.name } });
        await prisma.starSystemRanking.deleteMany({ where: { systemName: sys.name } });
        await prisma.rankedSystem.delete({ where: { name_game: { name: sys.name, game: sys.game } } });
    }

    // Also clean up stray StarSystemRankings that might not have a RankedSystem
    const badStars = await prisma.starSystemRanking.findMany({
        where: {
            OR: [
                { systemName: { endsWith: '_EURODREAMS' } },
                { systemName: { endsWith: '_TOTOLOTO' } }
            ]
        }
    });
    console.log(`Found ${badStars.length} orphan StarSystemRankings.`);
    for (const s of badStars) {
        await prisma.starSystemRanking.delete({ where: { systemName_game: { systemName: s.systemName, game: s.game } } });
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
