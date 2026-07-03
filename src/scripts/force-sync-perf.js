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

        console.log('Fetching local SystemPerformance for Diagonais da Matriz...');
        const allLocal = await localPrisma.systemPerformance.findMany({
            where: { systemName: 'Diagonais da Matriz' } // we can also sync others if needed, but let's sync ALL to be safe
        });
        
        // Actually, let's sync all SystemPerformance just in case any are missing
        const allPerformances = await localPrisma.systemPerformance.findMany();
        console.log(`Found ${allPerformances.length} total local SystemPerformance records.`);

        const chunkSize = 1000;
        let pushed = 0;
        let skipped = 0;

        console.log(`Pushing records to Prod...`);
        for (let i = 0; i < allPerformances.length; i += chunkSize) {
            const chunk = allPerformances.slice(i, i + chunkSize);
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
                await prodPrisma.systemPerformance.createMany({
                    data: mappedChunk,
                    skipDuplicates: true
                });
                pushed += mappedChunk.length;
            }
            console.log(`Processed chunk ${i} to ${i + chunkSize}`);
        }
        console.log(`Finished syncing SystemPerformance! Pushed: ${pushed}, Skipped: ${skipped}`);

    } catch (e) {
        console.error('Error:', e);
    } finally {
        await localPrisma.$disconnect();
        await prodPrisma.$disconnect();
    }
}

sync();
