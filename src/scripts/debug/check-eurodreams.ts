import { prisma } from '@/lib/prisma';

async function check() {
    const count = await prisma.draw.count({ where: { game: 'EURODREAMS' } });
    const systems = await prisma.rankedSystem.count({ where: { game: 'EURODREAMS' } });

    console.log('📊 EuroDreams Status:');
    console.log(`   Draws: ${count}`);
    console.log(`   Systems Registered: ${systems}`);

    if (count > 0) {
        const latest = await prisma.draw.findFirst({
            where: { game: 'EURODREAMS' },
            orderBy: { date: 'desc' }
        });
        const oldest = await prisma.draw.findFirst({
            where: { game: 'EURODREAMS' },
            orderBy: { date: 'asc' }
        });

        console.log(`   Date Range: ${oldest?.date.toISOString().split('T')[0]} to ${latest?.date.toISOString().split('T')[0]}`);
    }

    await prisma.$disconnect();
}

check();
