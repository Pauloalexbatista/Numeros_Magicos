import { prisma } from './src/lib/prisma';

async function purgeSystems() {
    console.log('🗑️ Purging hated systems from database...');

    const unwantedKeywords = [
        'Sistema Ouro', 'Sistema Prata', 'Sistema Bronze', 'Sistema Platina',
        'Combinado', 'Random', 'Consensus', 'Medal', 'Sem Pontas', 'Camadas', 'Vortex'
    ];

    const allSystems = await prisma.rankedSystem.findMany({ select: { name: true } });
    
    const systemsToDelete = allSystems
        .map(s => s.name)
        .filter(name => unwantedKeywords.some(keyword => name.includes(keyword)));

    if (systemsToDelete.length === 0) {
        console.log('No unwanted systems found in DB.');
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
        
        console.log('✅ Unwanted systems purged.');
    }

    await prisma.$disconnect();
}

purgeSystems().catch(console.error);
