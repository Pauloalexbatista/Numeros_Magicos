
import { prisma } from '@/lib/prisma';
import { rankedSystems } from '@/services/ranked-systems';
import { seedPerformanceByName } from './seed-performance-by-name';

async function seedPerformanceSequential() {
    console.log('🐌 SEQUENTIAL PERFORMANCE HISTORY BACKFILL');
    console.log('═'.repeat(60));
    console.log(`🎯 Total Systems to Process: ${rankedSystems.length}`);
    console.log('⚠️  This will generate ~90,000 predictions (2004-2025). This will take time!\n');

    for (const [index, system] of rankedSystems.entries()) {
        console.log(`\n⏳ [${index + 1}/${rankedSystems.length}] Starting ${system.name}...`);

        try {
            await seedPerformanceByName(system.name);
        } catch (error) {
            console.error(`❌ Failed processing ${system.name}:`, error);
        }

        // Small pause between systems
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('\n\n✨ All systems processed!');
}

seedPerformanceSequential()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
