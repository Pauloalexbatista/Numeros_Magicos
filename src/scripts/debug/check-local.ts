
import { prisma } from '../../lib/prisma';

async function checkLocalCount() {
    const count = await prisma.rankedSystem.count();
    console.log(`Local RankedSystems Count: ${count}`);

    // Check for a known system
    const hotNumbers = await prisma.rankedSystem.findUnique({ where: { name: 'Hot Numbers' } });
    console.log('Hot Numbers exists:', !!hotNumbers);
}

checkLocalCount().catch(console.error).finally(() => prisma.$disconnect());
