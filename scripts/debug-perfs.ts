import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

async function main() {
    const lastDrawEM = await prisma.draw.findFirst({ where: { game: 'EUROMILLIONS' }, orderBy: { date: 'desc' } });
    console.log('Last EuroMillions Draw:', lastDrawEM);
    if (lastDrawEM) {
        const perfs = await prisma.systemPerformance.findMany({ where: { drawId: lastDrawEM.id } });
        const starPerfs = await prisma.starSystemPerformance.findMany({ where: { drawId: lastDrawEM.id } });
        console.log(`EM Last Draw perfs: Numbers=${perfs.length}, Stars=${starPerfs.length}`);
    }

    const lastDrawTD = await prisma.draw.findFirst({ where: { game: 'EURODREAMS' }, orderBy: { date: 'desc' } });
    console.log('\nLast EuroDreams Draw:', lastDrawTD);
    if (lastDrawTD) {
        const perfs = await prisma.systemPerformance.findMany({ where: { drawId: lastDrawTD.id } });
        console.log(`ED Last Draw perfs: Numbers=${perfs.length}`);
    }
}
main().finally(() => prisma.$disconnect());
