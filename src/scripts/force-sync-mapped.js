const { PrismaClient } = require('@prisma/client');

async function sync() {
    const localPrisma = new PrismaClient({
        datasources: { db: { url: process.env.DATABASE_URL || 'file:./dev.db' } }
    });

    let ProdClient;
    try {
        ProdClient = require('@prisma/client-prod').PrismaClient;
    } catch(e) {
        ProdClient = PrismaClient;
    }

    const prodUrl = process.env.POSTGRES_URL_PROD || 'postgresql://admin_magico:UmaSenhaForte123@172.16.16.6:5432/numeros_magicos_prod?connection_limit=1';
    const prodPrisma = new ProdClient({
        datasources: { db: { url: prodUrl } }
    });

    try {
        console.log('Fetching local and prod draws to build ID map...');
        const localDraws = await localPrisma.draw.findMany({ select: { id: true, game: true, date: true } });
        const prodDraws = await prodPrisma.draw.findMany({ select: { id: true, game: true, date: true } });

        const drawMap = new Map();
        for (const ld of localDraws) {
            const dateStr = ld.date.toISOString().split('T')[0];
            const key = `${ld.game}_${dateStr}`;
            
            const pd = prodDraws.find(p => p.game === ld.game && p.date.toISOString().split('T')[0] === dateStr);
            if (pd) {
                drawMap.set(ld.id, pd.id);
            }
        }

        console.log(`Mapped ${drawMap.size} draws from local to prod.`);

        console.log('Fetching all local FullPool records...');
        const allLocal = await localPrisma.systemPerformanceFullPool.findMany();
        
        console.log(`Pushing ${allLocal.length} records to Prod...`);
        let pushed = 0;
        let skipped = 0;

        const chunkSize = 1000;
        for (let i = 0; i < allLocal.length; i += chunkSize) {
            const chunk = allLocal.slice(i, i + chunkSize);
            const mappedChunk = [];

            for (const c of chunk) {
                const prodDrawId = drawMap.get(c.drawId);
                if (prodDrawId) {
                    mappedChunk.push({
                        ...c,
                        id: undefined,
                        drawId: prodDrawId
                    });
                } else {
                    skipped++;
                }
            }

            if (mappedChunk.length > 0) {
                await prodPrisma.systemPerformanceFullPool.createMany({
                    data: mappedChunk,
                    skipDuplicates: true
                });
                pushed += mappedChunk.length;
            }
            console.log(`Processed chunk ${i} to ${i + chunkSize}`);
        }
        console.log(`Finished syncing SystemPerformanceFullPool to VPS! Pushed: ${pushed}, Skipped (no mapped draw): ${skipped}`);

    } catch (e) {
        console.error('Error:', e);
    } finally {
        await localPrisma.$disconnect();
        await prodPrisma.$disconnect();
    }
}

sync();
