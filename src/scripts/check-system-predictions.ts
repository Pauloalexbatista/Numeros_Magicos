import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkSystemPredictions() {
    console.log('🔍 Verificando previsões por sistema...\n');

    // Get count of predictions per system
    const systems = await prisma.systemPrediction.groupBy({
        by: ['systemName'],
        _count: {
            id: true
        },
        orderBy: {
            _count: {
                id: 'desc'
            }
        }
    });

    console.log('📊 Total de previsões por sistema:\n');
    systems.forEach((sys, idx) => {
        console.log(`${idx + 1}. ${sys.systemName}: ${sys._count.id} previsões`);
    });

    console.log('\n🎯 Sistemas com menos de 1896 previsões:\n');
    const incomplete = systems.filter(s => s._count.id < 1896);
    if (incomplete.length === 0) {
        console.log('✅ Todos os sistemas têm dados completos!');
    } else {
        incomplete.forEach(sys => {
            console.log(`❌ ${sys.systemName}: ${sys._count.id} / 1896 (faltam ${1896 - sys._count.id})`);
        });
    }

    // Check specific systems
    const targetSystems = [
        'Random Generator',
        'Vortex MultiChannel (2 canais)',
        'Clustering',
        'Markov Chain'
    ];

    console.log('\n🎯 Sistemas selecionados:\n');
    for (const sysName of targetSystems) {
        const count = await prisma.systemPrediction.count({
            where: { systemName: sysName }
        });
        console.log(`${count === 1896 ? '✅' : '❌'} ${sysName}: ${count} previsões`);
    }

    await prisma.$disconnect();
}

checkSystemPredictions().catch(console.error);
