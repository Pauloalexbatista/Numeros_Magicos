import { prisma } from './src/lib/prisma';
import { initializeSystems } from './src/services/ranking';

async function purgeRemainingExtras() {
    console.log('🗑️ Purging extra systems to get 10x10 counts...');

    const unwantedSystems = [
        'média sem as pontas',
        'Vortex Stars',
        'Média +1 Stars'
    ];

    const allSystems = await prisma.rankedSystem.findMany({ select: { name: true } });
    
    const systemsToDelete = allSystems
        .map(s => s.name)
        .filter(name => unwantedSystems.includes(name));

    if (systemsToDelete.length === 0) {
        console.log('No extra systems found in DB.');
    } else {
        console.log(`Found systems to delete:`, [...new Set(systemsToDelete)]);
        
        await prisma.cachedPrediction.deleteMany({ where: { systemName: { in: systemsToDelete } } });
        await prisma.systemPrediction.deleteMany({ where: { systemName: { in: systemsToDelete } } });
        await prisma.systemPerformance.deleteMany({ where: { systemName: { in: systemsToDelete } } });
        await prisma.systemPerformanceStaging.deleteMany({ where: { systemName: { in: systemsToDelete } } });
        await prisma.starSystemPerformance.deleteMany({ where: { systemName: { in: systemsToDelete } } });
        await prisma.systemRanking.deleteMany({ where: { systemName: { in: systemsToDelete } } });
        
        await prisma.rankedSystem.deleteMany({ where: { name: { in: systemsToDelete } } });
        
        console.log('✅ Extra systems purged.');
    }

    console.log('🚀 Re-initializing...');
    await initializeSystems();

    await prisma.$disconnect();
}

purgeRemainingExtras().catch(console.error);
