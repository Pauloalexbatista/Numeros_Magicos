
import { prisma } from '../../lib/prisma';
import { starSystems } from '../../services/star-systems';

async function main() {
    console.log('✨ Seeding Star Systems into RankedSystem table...');

    for (const system of starSystems) {
        try {
            const result = await prisma.rankedSystem.upsert({
                where: { name: system.name },
                update: {
                    description: system.description
                },
                create: {
                    name: system.name,
                    description: system.description,
                    isActive: true
                }
            });
            console.log(`✅ System "${system.name}" synced (ID: ${result.id})`);
        } catch (error) {
            console.error(`❌ Error syncing "${system.name}":`, error);
        }
    }

    console.log('🎉 Star Systems seeding complete!');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
