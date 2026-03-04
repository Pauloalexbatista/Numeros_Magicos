import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

async function main() {
    console.log("💣 Nuking unwanted systems from Production DB...");

    const keywords = [
        'Anti-', 'Consensus', 'Combinado', 'Sist Média', 'Sistema Média',
        'Oscilação', 'Universal Oscilação', 'Média', 'Multi-Canal', 'Ouro', 'Prata', 'Bronze', 'Medalha', 'Vortex Multi-Channel'
    ];

    const whereClauses = keywords.map(kw => ({ name: { contains: kw } }));

    // 1. Encontrar todos os sistemas RankedSystem que correspondam a estas palavras
    const systemsToDelete = await prisma.rankedSystem.findMany({
        where: { OR: whereClauses }
    });

    console.log(`Found ${systemsToDelete.length} bad Base Systems to obliterate.`);
    for (const sys of systemsToDelete) {
        console.log(`- Deleting: ${sys.name}`);
        await prisma.cachedPrediction.deleteMany({ where: { systemName: sys.name } });
        await prisma.systemPerformance.deleteMany({ where: { systemName: sys.name } });
        await prisma.systemPerformanceStaging.deleteMany({ where: { systemName: sys.name } });
        await prisma.starSystemPerformance.deleteMany({ where: { systemName: sys.name } });
        await prisma.systemRanking.deleteMany({ where: { systemName: sys.name } });
        await prisma.starSystemRanking.deleteMany({ where: { systemName: sys.name } });
        await prisma.rankedSystem.delete({ where: { name_game: { name: sys.name, game: sys.game } } });
    }

    // 2. Limpar os órfãos baseados nas mesmas keywords no SystemRanking
    const rankingWhere = keywords.map(kw => ({ systemName: { contains: kw } }));

    await prisma.systemPerformance.deleteMany({ where: { OR: rankingWhere } });
    await prisma.starSystemPerformance.deleteMany({ where: { OR: rankingWhere } });
    await prisma.systemRanking.deleteMany({ where: { OR: rankingWhere } });
    await prisma.starSystemRanking.deleteMany({ where: { OR: rankingWhere } });
    await prisma.cachedPrediction.deleteMany({ where: { OR: rankingWhere } });

    console.log("✅ Database Nuke Complete. Re-verifying active systems...");

    const activeNum = await prisma.rankedSystem.findMany({
        where: { game: 'EUROMILLIONS', domain: 'NUMBERS' },
        orderBy: { name: 'asc' }
    });
    console.log("\nCurrent NUMBERS Systems:");
    activeNum.forEach(s => console.log(`- ${s.name}`));

    const activeStar = await prisma.rankedSystem.findMany({
        where: { game: 'EUROMILLIONS', domain: 'STARS' },
        orderBy: { name: 'asc' }
    });
    console.log("\nCurrent STARS Systems:");
    activeStar.forEach(s => console.log(`- ${s.name}`));

}
main().catch(console.error).finally(() => prisma.$disconnect());
