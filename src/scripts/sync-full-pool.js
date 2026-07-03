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
    console.log("Starting FullPool Sync to PROD...");
    try {
        const localCount = await localPrisma.systemPerformanceFullPool.count();
        console.log("Local FullPool count:", localCount);
        const prodCount = await prodPrisma.systemPerformanceFullPool.count();
        console.log("Prod FullPool count:", prodCount);

        if (localCount > prodCount) {
            console.log("Fetching missing records...");
            const missingRecords = await localPrisma.systemPerformanceFullPool.findMany({
                orderBy: { id: 'asc' },
                skip: prodCount,
            });

            console.log(`Found ${missingRecords.length} records to sync.`);

            const batchSize = 1000;
            for (let i = 0; i < missingRecords.length; i += batchSize) {
                const batch = missingRecords.slice(i, i + batchSize);
                const mappedBatch = batch.map(r => ({
                    id: r.id, // Keep ID to maintain sync
                    drawId: r.drawId,
                    game: r.game,
                    systemName: r.systemName,
                    predictedNumbers: r.predictedNumbers,
                    actualNumbers: r.actualNumbers,
                    createdAt: r.createdAt
                }));

                await prodPrisma.systemPerformanceFullPool.createMany({
                    data: mappedBatch,
                    skipDuplicates: true
                });
                console.log(`Synced ${Math.min(i + batchSize, missingRecords.length)} / ${missingRecords.length}`);
            }
            console.log("Sync Complete!");
        } else {
            console.log("No missing records to sync.");
        }
    } catch (e) {
        console.error("Error syncing:", e);
    } finally {
        await localPrisma.$disconnect();
        await prodPrisma.$disconnect();
    }
}

run();
