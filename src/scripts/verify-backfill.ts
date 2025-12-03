import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyBackfill() {
    const totalDraws = await prisma.draw.count();
    const totalPerformances = await prisma.systemPerformance.count();
    const systems = await prisma.rankedSystem.findMany({ include: { _count: { select: { performances: true } } } });

    console.log(`📊 Total Draws in DB: ${totalDraws}`);
    console.log(`📈 Total Performance Records: ${totalPerformances}`);

    console.log('\nDetailed per System:');
    systems.forEach(s => {
        console.log(`- ${s.name}: ${s._count.performances} records`);
    });

    // Check the range of draws covered
    const firstPerf = await prisma.systemPerformance.findFirst({ orderBy: { drawId: 'asc' } });
    const lastPerf = await prisma.systemPerformance.findFirst({ orderBy: { drawId: 'desc' } });

    if (firstPerf && lastPerf) {
        console.log(`\n📅 Range Covered: Draw ID ${firstPerf.drawId} to ${lastPerf.drawId}`);
    }
}

verifyBackfill()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
