import { prisma } from './src/lib/prisma';

async function checkSystemPredictions() {
    console.log('🔍 Verificando previsões por sistema...\n');

    const systems = await prisma.rankedSystem.findMany({
        orderBy: { name: 'asc' }
    });

    for (const system of systems) {
        const count = await prisma.systemPrediction.count({
            where: { systemName: system.name }
        });

        console.log(`${system.name}: ${count} previsões`);
    }

    await prisma.$disconnect();
}

checkSystemPredictions();
