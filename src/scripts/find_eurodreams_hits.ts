
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function findRecentHits() {
    console.log("🔍 Procurando acertos de 6 no EuroDreams nos sorteios recentes...\n");

    const hits = await prisma.systemPerformance.findMany({
        where: {
            draw: { game: 'EURODREAMS' },
            hits: 6
        },
        include: {
            draw: true
        },
        orderBy: {
            draw: { date: 'desc' }
        },
        take: 10
    });

    if (hits.length === 0) {
        console.log("❌ Nenhum acerto de 6 encontrado.");
    } else {
        console.table(hits.map(h => ({
            drawId: h.drawId,
            date: h.draw.date,
            systemName: h.systemName,
            hits: h.hits
        })));
    }

    await prisma.$disconnect();
}

findRecentHits().catch(console.error);
