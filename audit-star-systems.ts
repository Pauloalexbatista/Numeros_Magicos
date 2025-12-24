/**
 * AUDITORIA DE SISTEMAS DE ESTRELAS
 * Verifica se todos os sistemas de estrelas têm dados após recalculação
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function auditStarSystems() {
    console.log('🌟 AUDITORIA DE SISTEMAS DE ESTRELAS');
    console.log('='.repeat(80));

    // 1. Verificar StarSystemRanking
    const rankings = await prisma.starSystemRanking.findMany({
        orderBy: { avgAccuracy: 'desc' }
    });

    console.log(`\n📊 Total de sistemas de estrelas: ${rankings.length}\n`);

    // 2. Para cada sistema, mostrar dados
    for (const rank of rankings) {
        // Verificar StarSystemPerformance
        const perfCount = await prisma.starSystemPerformance.count({
            where: { systemName: rank.systemName }
        });

        const status = perfCount > 0 ? '✅' : '❌';
        console.log(
            `${status} ${rank.systemName.padEnd(35)} | ` +
            `Accuracy: ${rank.avgAccuracy.toFixed(1)}% | ` +
            `Predições: ${rank.totalPredictions.toString().padStart(4)} | ` +
            `Hits: ${rank.totalHits.toString().padStart(4)} | ` +
            `Performance: ${perfCount.toString().padStart(4)}`
        );
    }

    // 3. Resumo
    console.log('\n' + '='.repeat(80));
    const withData = rankings.filter(r => r.totalPredictions > 0);
    const withoutData = rankings.filter(r => r.totalPredictions === 0);

    console.log(`\n✅ Sistemas COM dados: ${withData.length}`);
    console.log(`❌ Sistemas SEM dados: ${withoutData.length}`);

    if (withoutData.length > 0) {
        console.log('\n🚨 Sistemas sem dados:');
        withoutData.forEach(r => console.log(`   - ${r.systemName}`));
    }

    // 4. Top 5
    console.log('\n🏆 TOP 5 SISTEMAS DE ESTRELAS:');
    rankings.slice(0, 5).forEach((r, i) => {
        console.log(`   ${i + 1}. ${r.systemName} - ${r.avgAccuracy.toFixed(1)}%`);
    });

    await prisma.$disconnect();
}

auditStarSystems().catch(console.error);
