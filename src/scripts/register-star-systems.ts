import { prisma } from '../lib/prisma';
import { starSystems } from '../services/star-systems';

async function registerStarSystems() {
    console.log('📝 Registering Star Systems in RankedSystem table...\n');

    for (const sys of starSystems) {
        try {
            await prisma.rankedSystem.upsert({
                where: { name: sys.name },
                update: { description: sys.description },
                create: { name: sys.name, description: sys.description }
            });
            console.log(`✅ ${sys.name}`);
        } catch (error) {
            console.log(`❌ ${sys.name}: ${error}`);
        }
    }

    console.log(`\n✨ Done! Registered ${starSystems.length} systems.`);
    await prisma.$disconnect();
}

registerStarSystems().catch(console.error);
