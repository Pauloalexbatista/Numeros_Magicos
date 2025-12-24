import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkSystems() {
    const systems = [
        'Quarteto Complementar',
        'Quarteto de Impacto',
        'Quarteto de Impacto (Hot + Pascal + Elastic + Random)',
        'Consensus Auto (Vortex + Camadas + Media3)',
        'Consensus Auto (Vortex + LSTM + Media3)',
        'Machine Learning (Regressão Logística)'
    ];

    console.log('🔍 Verificando sistemas:\n');

    for (const sys of systems) {
        const count = await prisma.systemPrediction.count({
            where: { systemName: sys }
        });
        console.log(`${count > 0 ? '✅' : '❌'} ${sys}: ${count} predições`);
    }

    await prisma.$disconnect();
}

checkSystems();
