require('dotenv').config();
const { PrismaClient } = require('@prisma/client-prod');

const prisma = new PrismaClient({
    datasources: { db: { url: process.env.POSTGRES_URL_PROD } }
});

async function check() {
    // Check EuroDreams latest draw
    const lastDraw = await prisma.draw.findFirst({
        where: { game: 'EURODREAMS' },
        orderBy: { date: 'desc' },
        select: { id: true, date: true, numbers: true, stars: true }
    });
    
    console.log('Last EuroDreams draw:', lastDraw?.id, lastDraw?.date?.toISOString()?.split('T')[0]);
    
    if (!lastDraw) return;
    
    // Check old table
    const oldCount = await prisma.systemPerformance.count({
        where: { drawId: lastDraw.id }
    });
    console.log('Old systemPerformance entries for this draw:', oldCount);
    
    // Check new table
    const newCount = await prisma.systemPerformanceFullPool.count({
        where: { drawId: lastDraw.id }
    });
    console.log('New systemPerformanceFullPool entries for this draw:', newCount);
    
    // List all ranked systems for EURODREAMS
    const systems = await prisma.rankedSystem.count({
        where: { game: 'EURODREAMS', domain: 'NUMBERS', isActive: true }
    });
    console.log('Active EURODREAMS number systems:', systems);
}

check().catch(console.error).finally(() => prisma.$disconnect());
