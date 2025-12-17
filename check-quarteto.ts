import { prisma } from '@/lib/prisma';

async function checkQuarteto() {
    // Verificar performance
    const perf = await prisma.systemPerformance.findFirst({
        where: { systemName: 'Quarteto Complementar' }
    });

    console.log('\n🎯 QUARTETO COMPLEMENTAR - Resultados:\n');

    if (perf) {
        console.log(`✅ Sistema encontrado!`);
        console.log(`📊 Accuracy: ${perf.avgAccuracy}%`);
        console.log(`🏆 Jackpots: ${perf.totalJackpots}`);
        console.log(`⭐ Score: ${perf.score}`);
        console.log(`📈 Rank: ${perf.rank || 'N/A'}`);
    } else {
        console.log(`❌ Sistema não encontrado em SystemPerformance`);

        // Verificar se tem previsões
        const count = await prisma.systemPrediction.count({
            where: { systemName: 'Quarteto Complementar' }
        });
        console.log(`📋 Previsões na BD: ${count}`);
    }

    // Top 10 sistemas
    console.log('\n📊 TOP 10 SISTEMAS:\n');
    const top10 = await prisma.systemPerformance.findMany({
        orderBy: { score: 'desc' },
        take: 10,
        select: {
            systemName: true,
            avgAccuracy: true,
            totalJackpots: true,
            score: true
        }
    });

    top10.forEach((s, idx) => {
        const marker = s.systemName === 'Quarteto Complementar' ? '🎯' : '  ';
        console.log(`${marker} ${idx + 1}. ${s.systemName}`);
        console.log(`      Accuracy: ${s.avgAccuracy}% | Jackpots: ${s.totalJackpots} | Score: ${s.score}`);
    });

    await prisma.$disconnect();
}

checkQuarteto();
