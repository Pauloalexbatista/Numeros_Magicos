import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Testing Prisma Client Properties...');

    // Check RankedSystem unique input
    console.log('RankedSystem unique input fields:', Object.keys((prisma as any).rankedSystem));

    // Check CachedPrediction unique input fields
    console.log('CachedPrediction fields:', Object.keys((prisma as any).cachedPrediction));
}

main().catch(console.error).finally(() => prisma.$disconnect());
