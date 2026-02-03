import { prisma } from '@/lib/prisma';

async function checkSystemDescriptions() {
    const systems = await prisma.rankedSystem.findMany({
        orderBy: [
            { game: 'asc' },
            { name: 'asc' }
        ],
        take: 10
    });

    console.log('📋 Sample Systems in Database:\n');
    systems.forEach(s => {
        console.log(`Game: ${s.game}`);
        console.log(`Name: ${s.name}`);
        console.log(`Description: ${s.description || '(empty)'}`);
        console.log(`Active: ${s.isActive}`);
        console.log('---');
    });

    const totalSystems = await prisma.rankedSystem.count();
    const withDescriptions = await prisma.rankedSystem.count({
        where: { description: { not: null } }
    });

    console.log(`\n📊 Summary:`);
    console.log(`Total Systems: ${totalSystems}`);
    console.log(`With Descriptions: ${withDescriptions}`);
    console.log(`Without Descriptions: ${totalSystems - withDescriptions}`);

    await prisma.$disconnect();
}

checkSystemDescriptions();
