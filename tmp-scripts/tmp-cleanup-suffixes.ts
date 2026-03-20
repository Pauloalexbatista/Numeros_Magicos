import { prisma } from './src/lib/prisma';
import { initializeSystems } from './src/services/ranking';

async function purgeSuffixedSystems() {
    console.log('🗑️ Purging suffixed systems from database...');

    const allSystems = await prisma.rankedSystem.findMany({ select: { name: true } });
    
    const systemsToDelete = allSystems
        .map(s => s.name)
        .filter(name => name.includes('_TOTOLOTO') || name.includes('_EURODREAMS') || name.includes(' (EuroDreams)'));

    if (systemsToDelete.length === 0) {
        console.log('No suffixed systems found in DB.');
    } else {
        console.log(`Found ${systemsToDelete.length} systems to delete:`, systemsToDelete);
        
        // Delete caching and predictions and performances first (Foreign Keys)
        await prisma.cachedPrediction.deleteMany({
            where: { systemName: { in: systemsToDelete } }
        });
        await prisma.systemPrediction.deleteMany({
            where: { systemName: { in: systemsToDelete } }
        });
        await prisma.systemPerformance.deleteMany({
            where: { systemName: { in: systemsToDelete } }
        });
        await prisma.systemPerformanceStaging.deleteMany({
            where: { systemName: { in: systemsToDelete } }
        });
        await prisma.starSystemPerformance.deleteMany({
            where: { systemName: { in: systemsToDelete } }
        });
        await prisma.systemRanking.deleteMany({
            where: { systemName: { in: systemsToDelete } }
        });
        
        // Delete the system itself
        await prisma.rankedSystem.deleteMany({
            where: { name: { in: systemsToDelete } }
        });
        
        console.log('✅ Suffixed systems purged.');
    }

    console.log('🚀 Re-initializing systems to ensure exactly 11 base numbers, 11 base stars per game...');
    await initializeSystems();

    await prisma.$disconnect();
}

purgeSuffixedSystems().catch(console.error);
