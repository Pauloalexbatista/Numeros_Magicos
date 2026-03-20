import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function purgeIntruders() {
    console.log('🧹 Inciando Purga de Sistemas Obsoletos (Randoms / Ensembles)...');

    const intruders = [
        'Random Generator',
        'Anti-Random',
        'Ensemble'
    ];

    const targetSystems = await prisma.rankedSystem.findMany({
        where: {
            OR: intruders.map(keyword => ({
                name: { contains: keyword }
            }))
        }
    });

    if (targetSystems.length === 0) {
        console.log('✅ Nenhum sistema intruso encontrado na Tabela de Rankings!');
        return;
    }

    console.log(`🎯 Encontrados ${targetSystems.length} sistemas intrusos. Procedendo à sua aniquilação total...`);

    const namesToDelete = targetSystems.map(s => s.name);

    await prisma.systemPerformance.deleteMany({ where: { systemName: { in: namesToDelete } } });
    await prisma.starSystemPerformance.deleteMany({ where: { systemName: { in: namesToDelete } } });
    await prisma.systemPrediction.deleteMany({ where: { systemName: { in: namesToDelete } } });
    await prisma.cachedPrediction.deleteMany({ where: { systemName: { in: namesToDelete } } });
    await prisma.systemRanking.deleteMany({ where: { systemName: { in: namesToDelete } } });
    
    // Por fim, elimina as raízes no Registry
    const deletedRoots = await prisma.rankedSystem.deleteMany({ where: { name: { in: namesToDelete } } });

    console.log(`🔥 Purga Concluída! ${deletedRoots.count} instâncias do Registry evaporadas.`);
}

purgeIntruders()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
