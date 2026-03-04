import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

async function main() {
    const counts = await prisma.systemPerformance.groupBy({
        by: ['game'],
        _count: { id: true }
    });
    console.log('SystemPerformance by game:');
    console.log(counts);

    const starCounts = await prisma.starSystemPerformance.groupBy({
        by: ['game'],
        _count: { id: true }
    });
    console.log('StarSystemPerformance by game:');
    console.log(starCounts);
}
main().finally(() => prisma.$disconnect());
