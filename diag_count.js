const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const name = 'Quarteto de Impacto (Hot + Pascal + Elastic + Random)';
        const count = await prisma.systemPerformance.count({ where: { systemName: name } });
        console.log(`System: ${name}`);
        console.log(`Count: ${count}`);

        const sys = await prisma.rankedSystem.findUnique({ where: { name: name } });
        console.log(`RankedSystem entry: ${sys ? 'YES' : 'NO'}`);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
