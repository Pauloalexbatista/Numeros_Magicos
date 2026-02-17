
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkSystems() {
    const systems = await prisma.rankedSystem.findMany({
        select: { name: true, game: true, domain: true, isActive: true }
    });

    console.log('--- REGISTERED SYSTEMS ---');
    console.table(systems);

    const edPerfs = await prisma.systemPerformance.findMany({
        where: { system: { game: 'EURODREAMS' } },
        take: 5
    });
    console.log(`\nEuroDreams Performance Samples length: ${edPerfs.length}`);
}

checkSystems().finally(() => prisma.$disconnect());
