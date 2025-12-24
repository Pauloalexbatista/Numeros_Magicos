/**
 * AUDITORIA RÁPIDA - Sistemas ainda sem dados
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function quickAudit() {
    console.log('🔍 AUDITORIA RÁPIDA - Sistemas SEM Dados\n');

    const rankedSystems = await prisma.rankedSystem.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' }
    });

    const systemsWithoutData: string[] = [];

    for (const system of rankedSystems) {
        const predictionCount = await prisma.systemPrediction.count({
            where: { systemName: system.name }
        });

        const performanceCount = await prisma.systemPerformance.count({
            where: { systemName: system.name }
        });

        const hasData = predictionCount > 0 || performanceCount > 0;

        if (!hasData) {
            systemsWithoutData.push(system.name);
        }
    }

    console.log(`❌ Sistemas SEM dados: ${systemsWithoutData.length}\n`);

    if (systemsWithoutData.length > 0) {
        systemsWithoutData.forEach(name => console.log(`   - ${name}`));
    } else {
        console.log('✅ TODOS os sistemas têm dados!');
    }

    await prisma.$disconnect();
}

quickAudit().catch(console.error);
