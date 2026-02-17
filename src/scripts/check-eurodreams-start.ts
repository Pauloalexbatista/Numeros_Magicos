
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const firstDraw = await prisma.draw.findFirst({
            where: { game: 'EURODREAMS' },
            orderBy: { date: 'asc' }
        });

        const lastDraw = await prisma.draw.findFirst({
            where: { game: 'EURODREAMS' },
            orderBy: { date: 'desc' }
        });

        const count = await prisma.draw.count({
            where: { game: 'EURODREAMS' }
        });

        console.log(`\n📊 EuroDreams Database Status:`);
        console.log(`-----------------------------`);
        console.log(`📅 First Draw: ${firstDraw?.date.toISOString().split('T')[0]}`);
        console.log(`📅 Last Draw:  ${lastDraw?.date.toISOString().split('T')[0]}`);
        console.log(`🔢 Total Draws: ${count}`);
        console.log(`-----------------------------`);

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
