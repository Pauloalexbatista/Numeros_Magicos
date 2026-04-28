import { prisma } from '../../lib/prisma';

async function fix() {
    try {
        console.log('Creating table ai_model_store...');
        await prisma.$executeRawUnsafe(`
            CREATE TABLE ai_model_store (
                id SERIAL PRIMARY KEY,
                "modelType" TEXT UNIQUE NOT NULL,
                weights TEXT NOT NULL,
                metadata TEXT,
                "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Table created!');
    } catch (e: any) {
        console.error('Error:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}
fix();
