const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const count = await prisma.draw.count();
        const lastById = await prisma.draw.findFirst({ orderBy: { id: 'desc' } });
        const lastByDate = await prisma.draw.findFirst({ orderBy: { date: 'desc' } });

        console.log(`Total Draws: ${count}`);
        if (lastById) console.log(`Last by ID: ID=${lastById.id}, Date=${lastById.date.toISOString()}`);
        if (lastByDate) console.log(`Last by Date: ID=${lastByDate.id}, Date=${lastByDate.date.toISOString()}`);

        const sample = await prisma.draw.findMany({
            orderBy: { date: 'desc' },
            take: 5
        });
        console.log('--- LATEST 5 BY DATE ---');
        sample.forEach(d => console.log(`${d.id} | ${d.date.toISOString()} | ${d.numbers}`));

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
