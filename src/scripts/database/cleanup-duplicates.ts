
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function cleanup() {
    console.log('🧹 Cleaning up recent incorrect EuroDreams imports...');
    
    // Find draws created today
    const drawsToday = await prisma.draw.findMany({
        where: {
            game: 'EURODREAMS',
            createdAt: { gte: new Date('2026-04-17T10:00:00Z') }
        },
        select: { id: true }
    });

    const ids = drawsToday.map(d => d.id);
    console.log(`Found ${ids.length} draws to cleanup:`, ids);

    if (ids.length > 0) {
        // 1. Delete associated performances
        const perfDeleted = await prisma.systemPerformance.deleteMany({
            where: { drawId: { in: ids } }
        });
        console.log(`Deleted ${perfDeleted.count} performance records.`);

        const starPerfDeleted = await prisma.starSystemPerformance.deleteMany({
            where: { drawId: { in: ids } }
        });
        console.log(`Deleted ${starPerfDeleted.count} star performance records.`);

        const predictionsDeleted = await prisma.systemPrediction.deleteMany({
            where: { drawId: { in: ids } }
        });
        console.log(`Deleted ${predictionsDeleted.count} prediction records.`);

        // 2. Delete the draws
        const drawsDeleted = await prisma.draw.deleteMany({
            where: { id: { in: ids } }
        });
        console.log(`Deleted ${drawsDeleted.count} draw records.`);
    }

    console.log('✨ Cleanup finished.');
}

cleanup().catch(console.error).finally(() => prisma.$disconnect());
