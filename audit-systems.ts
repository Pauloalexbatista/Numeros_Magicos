/**
 * AUDITORIA DE SISTEMAS
 * Verifica quais sistemas têm dados e quais estão vazios
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function auditSystems() {
    console.log('🔍 AUDITORIA DE SISTEMAS - ' + new Date().toISOString());
    console.log('='.repeat(80));

    // 1. Verificar sistemas registados
    const rankedSystems = await prisma.rankedSystem.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' }
    });

    console.log(`\n📊 Total de sistemas ativos: ${rankedSystems.length}\n`);

    // 2. Para cada sistema, verificar dados
    const systemsWithData: string[] = [];
    const systemsWithoutData: string[] = [];

    for (const system of rankedSystems) {
        // Verificar SystemPrediction
        const predictionCount = await prisma.systemPrediction.count({
            where: { systemName: system.name }
        });

        // Verificar SystemPerformance
        const performanceCount = await prisma.systemPerformance.count({
            where: { systemName: system.name }
        });

        const hasData = predictionCount > 0 || performanceCount > 0;

        if (hasData) {
            systemsWithData.push(system.name);
            console.log(`✅ ${system.name.padEnd(45)} | Predições: ${predictionCount.toString().padStart(5)} | Performance: ${performanceCount.toString().padStart(5)}`);
        } else {
            systemsWithoutData.push(system.name);
            console.log(`❌ ${system.name.padEnd(45)} | SEM DADOS`);
        }
    }

    // 3. Resumo
    console.log('\n' + '='.repeat(80));
    console.log(`\n✅ Sistemas COM dados: ${systemsWithData.length}`);
    console.log(`❌ Sistemas SEM dados: ${systemsWithoutData.length}\n`);

    if (systemsWithoutData.length > 0) {
        console.log('🚨 SISTEMAS QUE PRECISAM RECALCULAR:');
        systemsWithoutData.forEach(name => console.log(`   - ${name}`));
    }

    // 4. Verificar último sorteio processado
    const lastDraw = await prisma.draw.findFirst({
        orderBy: { date: 'desc' }
    });

    console.log(`\n📅 Último sorteio na BD: ${lastDraw?.id} (${lastDraw?.date})`);

    // 5. Verificar quantos sorteios têm predições
    const drawsWithPredictions = await prisma.systemPrediction.groupBy({
        by: ['drawId'],
        _count: { drawId: true }
    });

    console.log(`📊 Sorteios com predições: ${drawsWithPredictions.length}`);

    await prisma.$disconnect();
}

auditSystems().catch(console.error);
