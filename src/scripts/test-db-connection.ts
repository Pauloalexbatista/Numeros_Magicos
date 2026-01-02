import { PrismaClient } from '@prisma/client';

async function testConnection() {
    console.log('Testing local SQLite connection...');

    const localPrisma = new PrismaClient({
        datasources: { db: { url: 'file:./prisma/dev.db' } }
    });

    try {
        const count = await localPrisma.draw.count();
        console.log(`✅ Successfully connected! Found ${count} draws.`);

        const lastDraw = await localPrisma.draw.findFirst({
            orderBy: { id: 'desc' },
            select: { id: true, date: true }
        });
        console.log(`Last draw: #${lastDraw?.id} on ${lastDraw?.date}`);

    } catch (error) {
        console.error('❌ Connection failed:', error);
    } finally {
        await localPrisma.$disconnect();
    }
}

testConnection();
