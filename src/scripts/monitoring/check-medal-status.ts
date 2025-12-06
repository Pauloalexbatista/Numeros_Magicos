import { prisma } from '../../lib/prisma';

async function main() {
    console.log('🕵️ Checking RankedSystem table for Medal Systems...\n');

    const medalSystems = ['Sistema Ouro', 'Sistema Prata', 'Sistema Bronze'];

    const systems = await prisma.rankedSystem.findMany({
        where: {
            name: { in: medalSystems }
        }
    });

    console.log(`Found ${systems.length} / ${medalSystems.length} systems.`);

    systems.forEach(sys => {
        console.log(`- ${sys.name}: Active=${sys.isActive}, ID=${sys.id}`);
    });

    if (systems.length < 3) {
        console.log('\n⚠️  Some systems are missing from the database!');
        const foundNames = systems.map(s => s.name);
        const missing = medalSystems.filter(n => !foundNames.includes(n));
        console.log(`Missing: ${missing.join(', ')}`);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
