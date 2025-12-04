import { prisma } from '../lib/prisma';

async function main() {
    const count = await prisma.systemPerformanceStaging.count();
    console.log(`Total records in Staging: ${count}`);

    const samples = await prisma.systemPerformanceStaging.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' }
    });

    console.log('Latest samples:', samples);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
