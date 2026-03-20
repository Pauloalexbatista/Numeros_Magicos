const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const systems = await prisma.rankedSystem.findMany({ select: { name: true } });
        console.log('--- SYSTEMS IN DB ---');
        systems.forEach(s => console.log(`"${s.name}"`));

        const perfs = await prisma.systemPerformance.findMany({
            select: { systemName: true },
            distinct: ['systemName'],
            take: 100
        });
        console.log('--- SYSTEMS WITH PERFORMANCES ---');
        perfs.forEach(p => console.log(`"${p.systemName}"`));
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
