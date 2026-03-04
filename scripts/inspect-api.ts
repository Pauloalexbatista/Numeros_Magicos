import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

async function main() {
    const game = 'EUROMILLIONS';
    const lastDraw = await prisma.draw.findFirst({
        where: { game },
        orderBy: { date: 'desc' },
        select: { id: true, date: true, numbers: true }
    });

    console.log("LAST DRAW EUROMILLIONS:", lastDraw);

    const performances = await prisma.systemPerformance.findMany({
        where: {
            drawId: lastDraw!.id,
            system: {
                domain: 'NUMBERS'
            }
        },
        orderBy: { hits: 'desc' },
        include: { system: true } // Let's see the exactly relationships
    });

    console.log(`\nFound ${performances.length} performances:`);
    performances.slice(0, 10).forEach(p => {
        console.log(`- ${p.systemName} (Game on perf: ${p.game}) -> Hits: ${p.hits}`);
    });

    // Check Star Systems
    const starPerfs = await prisma.starSystemPerformance.findMany({
        where: { drawId: lastDraw!.id }
    });
    console.log(`\nFound ${starPerfs.length} STAR performances for this draw.`);
    starPerfs.slice(0, 5).forEach(s => console.log(s.systemName));
}

main().finally(() => prisma.$disconnect());
