import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const systems = await prisma.rankedSystem.findMany({
        select: { name: true }
    });
    console.log('--- RANKED SYSTEMS ---');
    console.log(JSON.stringify(systems, null, 2));

    const performances = await prisma.systemPerformance.findMany({
        take: 10,
        select: { systemName: true }
    });
    console.log('--- SYSTEM PERFORMANCES (SAMPLES) ---');
    console.log(JSON.stringify(performances, null, 2));

    process.exit(0);
}
main();
