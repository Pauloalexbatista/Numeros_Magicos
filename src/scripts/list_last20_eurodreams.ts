
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listLast20() {
    console.log("📅 Listando últimos 20 sorteios de EuroDreams...\n");

    const draws = await prisma.draw.findMany({
        where: { game: 'EURODREAMS' },
        orderBy: { date: 'desc' },
        take: 20,
        select: { id: true, date: true }
    });

    console.table(draws.map(d => ({
        id: d.id,
        date: d.date.toISOString()
    })));

    const drawIds = draws.map(d => d.id);
    console.log(`\nContém ID 3654? ${drawIds.includes(3654) ? '✅ SIM' : '❌ NÃO'}`);

    await prisma.$disconnect();
}

listLast20().catch(console.error);
