
import { prisma } from '../../lib/prisma';

async function listSystems() {
    const systems = await prisma.rankedSystem.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' }
    });

    console.log(`Total Active Systems: ${systems.length}`);
    const anti = systems.filter(s => s.name.startsWith('Anti-'));
    console.log(`Anti-Systems Count: ${anti.length}`);

    if (anti.length > 0) {
        console.log('Sample Anti-Systems:');
        anti.slice(0, 5).forEach(s => console.log(` - ${s.name} (${s.game})`));
    } else {
        console.log('❌ NO ANTI-SYSTEMS FOUND!');
    }

    const base = systems.filter(s => !s.name.startsWith('Anti-'));
    console.log(`Base Systems Count: ${base.length}`);
}

listSystems()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
