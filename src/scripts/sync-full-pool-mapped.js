require('dotenv').config();
const { PrismaClient: LocalClient } = require('@prisma/client');
const { PrismaClient: ProdClient } = require('@prisma/client-prod');

const localPrisma = new LocalClient({
    datasources: { db: { url: process.env.DATABASE_URL } }
});

const prodUrl = process.env.POSTGRES_URL_PROD + (process.env.POSTGRES_URL_PROD?.includes('?') ? '&' : '?') + 'connection_limit=1';
const prodPrisma = new ProdClient({
    datasources: { db: { url: prodUrl } }
});

async function run() {
    console.log("Starting FullPool Sync to PROD (Mapped IDs)...");
    try {
        console.log('Fetching local and prod draws to build ID map...');
        const localDraws = await localPrisma.draw.findMany({ select: { id: true, game: true, date: true } });
        const prodDraws = await prodPrisma.draw.findMany({ select: { id: true, game: true, date: true } });

        const drawMap = new Map();
        for (const ld of localDraws) {
            const dateStr = ld.date.toISOString().split('T')[0];
            const pd = prodDraws.find(p => p.game === ld.game && p.date.toISOString().split('T')[0] === dateStr);
            if (pd) {
                drawMap.set(ld.id, pd.id);
            }
        }

        const localCount = await localPrisma.systemPerformanceFullPool.count();
        console.log("Local FullPool count:", localCount);

        const prodCount = await prodPrisma.systemPerformanceFullPool.count();
        console.log("Prod FullPool count:", prodCount);

        // ALWAYS sync because we might be missing the early ones or specific ones
        const missingRecords = await localPrisma.systemPerformanceFullPool.findMany({
            orderBy: { id: 'asc' },
            skip: prodCount
        });

        console.log(`Found ${missingRecords.length} records to sync.`);

        const batchSize = 500;
        let synced = 0;
        let skipped = 0;

        for (let i = 0; i < missingRecords.length; i += batchSize) {
            const batch = missingRecords.slice(i, i + batchSize);
            const mappedBatch = [];

            for (const r of batch) {
                const prodDrawId = drawMap.get(r.drawId);
                if (!prodDrawId) {
                    skipped++;
                    continue;
                }
                mappedBatch.push({
                    drawId: prodDrawId,
                    game: r.game,
                    systemName: r.systemName,
                    predictedNumbers: r.predictedNumbers,
                    actualNumbers: r.actualNumbers,
                    createdAt: r.createdAt
                });
            }

            if (mappedBatch.length > 0) {
                await prodPrisma.systemPerformanceFullPool.createMany({
                    data: mappedBatch,
                    skipDuplicates: true
                });
                synced += mappedBatch.length;
            }
            console.log(`Processed ${Math.min(i + batchSize, missingRecords.length)} / ${missingRecords.length} (Synced: ${synced}, Skipped: ${skipped})`);
        }
        console.log("Sync Complete!");
    } catch (e) {
        console.error("Error syncing:", e);
    } finally {
        await localPrisma.$disconnect();
        await prodPrisma.$disconnect();
    }
}

run();
