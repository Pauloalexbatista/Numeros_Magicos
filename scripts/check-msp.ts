import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

async function main() {
    const lastED = await prisma.draw.findFirst({ where: { game: 'EURODREAMS' }, orderBy: { date: 'desc' } });
    if (!lastED) return;

    const perfs = await prisma.systemPerformance.findMany({
        where: { drawId: lastED.id, systemName: 'média sem as pontas' }
    });
    console.log(`Perfs for 'média sem as pontas' on drawId ${lastED.id}:`);
    console.log(perfs.map(p => `ID: ${p.id}, Game: ${p.game}, Hits: ${p.hits}, System: ${p.systemName}`));

    // Let's check the API method directly
    const performances = await prisma.systemPerformance.findMany({
        where: {
            drawId: lastED.id,
            system: { domain: 'NUMBERS' }
        },
        orderBy: { hits: 'desc' }
    });
    console.log("\nDashboard Query returned elements:", performances.length);
    const msp = performances.filter(p => p.systemName === 'média sem as pontas');
    console.log(msp.map(p => `ID: ${p.id}, Game: ${p.game}, Hits: ${p.hits}, System: ${p.systemName}`));
}
main().finally(() => prisma.$disconnect());
