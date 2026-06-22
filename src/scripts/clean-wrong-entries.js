require('dotenv').config();

const { PrismaClient } = require('@prisma/client-prod');

const prisma = new PrismaClient({
    datasources: { db: { url: process.env.POSTGRES_URL_PROD } }
});

async function clean() {
    // Remove the entries we just added for Jun 15 and Jun 22 EuroDreams draws
    // (they used wrong HotNumbers fallback for complex systems)
    // Only keep the entries that were created in the last hour
    const cutoff = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago
    
    // Check what we have for these draws
    const draws = [6575, 6583]; // Jun 15 and Jun 22
    for (const drawId of draws) {
        const count = await prisma.systemPerformanceFullPool.count({ where: { drawId } });
        console.log('Draw ' + drawId + ' has ' + count + ' entries');
        
        const recent = await prisma.systemPerformanceFullPool.count({
            where: { drawId, createdAt: { gte: cutoff } }
        });
        console.log('  - ' + recent + ' created in the last hour');
    }
    
    const ok = process.argv[2] === '--delete';
    if (ok) {
        for (const drawId of draws) {
            await prisma.systemPerformanceFullPool.deleteMany({
                where: { drawId, createdAt: { gte: cutoff } }
            });
            console.log('Deleted recent entries for draw ' + drawId);
        }
    } else {
        console.log('\nRun with --delete to actually delete these entries');
    }
}

clean().catch(console.error).finally(() => prisma.$disconnect());
