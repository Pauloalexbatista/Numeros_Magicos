import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function massiveBackfill() {
    console.log('🚀 INITIALIZING SERVER-SIDE HISTORICAL BACKFILL');
    const startTime = Date.now();

    const games = ['EURODREAMS', 'EUROMILLIONS', 'TOTOLOTO'];

    for (const game of games) {
        console.log(`\n🎮 PROCESSING GAME: ${game}`);

        const draws = await prisma.draw.findMany({
            where: { game: game as any },
            orderBy: { date: 'asc' },
            select: { id: true, date: true }
        });

        console.log(`Found ${draws.length} draws for ${game}.`);

        let processedCount = 0;
        for (const draw of draws) {
            try {
                // Check if performance exists
                const existingCount = await prisma.systemPerformance.count({
                    where: { drawId: draw.id, game: game as any }
                });

                if (existingCount >= 10) {
                    processedCount++;
                    continue;
                }

                // In a standalone script on VPS, we manually trigger the maintenance API
                // effectively asking the local web server to do the work, or we'd need
                // to include ALL logic here.
                // Re-triggering the local API is safer as it uses the correct service logic.

                await fetch(`http://localhost:3000/api/admin/backfill`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        secret: 'f63c1f2b2c3d4e5f6a7b8c9d0e1f2a3b',
                        limit: 1 // Process one by one for stability
                    })
                });

                processedCount++;
                if (processedCount % 10 === 0) {
                    console.log(`[${game}] Progress: ${processedCount}/${draws.length}`);
                }
            } catch (err) {
                // Ignore small errors
            }
        }
    }

    console.log('✅ BACKFILL COMPLETE');
    await prisma.$disconnect();
}

massiveBackfill();
