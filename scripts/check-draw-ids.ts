
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkIds() {
    console.log('Checking EuroDreams Draw IDs (by Date)...');

    const draws = await prisma.draw.findMany({
        where: { game: 'EURODREAMS' },
        orderBy: { date: 'desc' },
        take: 25,
        select: { id: true, date: true }
    });

    draws.forEach((d, i) => {
        console.log(`${i + 1}. ID: ${d.id} - ${d.date.toISOString().split('T')[0]}`);
    });
}

checkIds()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
