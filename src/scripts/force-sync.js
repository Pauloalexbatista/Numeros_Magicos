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
        const localCount = await localPrisma.systemPerformanceFullPool.count();
        console.log(`Local FullPool count: ${localCount}`);

        const prodCount = await prodPrisma.systemPerformanceFullPool.count();
        console.log(`Prod FullPool count: ${prodCount}`);

        if (localCount > prodCount) {
            console.log('Fetching all local FullPool records...');
            const allLocal = await localPrisma.systemPerformanceFullPool.findMany();
            
            console.log(`Pushing ${allLocal.length} records to Prod...`);
            // Chunking to avoid payload too large
            const chunkSize = 1000;
            for (let i = 0; i < allLocal.length; i += chunkSize) {
                const chunk = allLocal.slice(i, i + chunkSize);
                await prodPrisma.systemPerformanceFullPool.createMany({
                    data: chunk.map(c => ({...c, id: undefined})),
                    skipDuplicates: true
                });
                console.log(`Pushed chunk ${i} to ${i + chunkSize}`);
            }
            console.log('Finished syncing SystemPerformanceFullPool to VPS!');
        } else {
            console.log('Prod is already up to date or has more records.');
        }

    } catch (e) {
        console.error('Error:', e);
    } finally {
        await localPrisma.$disconnect();
        await prodPrisma.$disconnect();
    }
}

sync();
