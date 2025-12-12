
import { prisma } from '@/lib/prisma';
import { rankedSystems } from '@/services/ranked-systems';
import { seedSystemByName } from './seed-system-by-name';

async function seedSequential() {
    console.log('🐌 SEQUENTIAL SYSTEM SEEDING');
    console.log('═'.repeat(60));
    console.log(`🎯 Total Systems to Process: ${rankedSystems.length}`);
    console.log('⚠️  This will process one system at a time to ensure stability.\n');

    for (const [index, system] of rankedSystems.entries()) {
        console.log(`\n⏳ [${index + 1}/${rankedSystems.length}] Starting ${system.name}...`);

        try {
            await seedSystemByName(system.name);
        } catch (error) {
            console.error(`❌ Failed processing ${system.name}:`, error);
        }

        // Small pause between systems to let DB breathe
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('\n\n✨ All systems processed!');
}

seedSequential()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
