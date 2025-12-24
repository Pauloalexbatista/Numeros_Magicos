/**
 * AUDITORIA INTELIGENTE
 * Ignora anti-sistemas (calculados automaticamente) e estrelas (tabela diferente)
 * Mostra apenas sistemas REAIS que precisam ser calculados
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function smartAudit() {
    console.log('🔍 AUDITORIA INTELIGENTE - Sistemas REAIS sem dados\n');

    const rankedSystems = await prisma.rankedSystem.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' }
    });

    const systemsWithoutData: string[] = [];

    for (const system of rankedSystems) {
        // SKIP: Anti-sistemas (são calculados automaticamente)
        if (system.name.startsWith('Anti-')) continue;

        // SKIP: Sistemas de estrelas (estão em StarSystemPerformance)
        if (system.name.includes('Stars') || system.name.includes('Star ') || system.name === 'Golden Pair') continue;

        // Verificar se tem dados
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

    console.log(`❌ Sistemas REAIS sem dados: ${systemsWithoutData.length}\n`);

    if (systemsWithoutData.length > 0) {
        systemsWithoutData.forEach(name => console.log(`   - ${name}`));
    } else {
        console.log('✅ TODOS os sistemas REAIS têm dados!');
    }

    await prisma.$disconnect();
}

smartAudit().catch(console.error);
