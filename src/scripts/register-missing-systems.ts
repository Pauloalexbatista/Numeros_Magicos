
import { prisma } from '../lib/prisma';
import { rankedSystems } from '../services/ranked-systems';

async function registerMissing() {
    console.log('🛠️  Registering Missing Systems...');

    for (const system of rankedSystems) {
        await prisma.rankedSystem.upsert({
            where: { name: system.name },
            update: {},
            create: {
                name: system.name,
                description: system.description || 'System auto-registered',
                isActive: true
            }
        });
    }
    console.log('✅ All systems registered.');
}

registerMissing()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
