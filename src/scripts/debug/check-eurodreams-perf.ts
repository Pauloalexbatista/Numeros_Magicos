import { prisma } from '@/lib/prisma';

async function checkPerformances() {
    const perfCount = await prisma.systemPerformance.count({
        where: { draw: { game: 'EURODREAMS' } }
    });

    const rankingCount = await prisma.systemRanking.count({
        where: {
            systemName: { contains: '(EuroDreams)' }
        }
    });

    const topRankings = await prisma.systemRanking.findMany({
        where: { systemName: { contains: '(EuroDreams)' } },
        orderBy: { avgAccuracy: 'desc' },
        take: 5
    });

    console.log('📊 EuroDreams Performance Status:');
    console.log(`   Performance Records: ${perfCount}`);
    console.log(`   Systems with Rankings: ${rankingCount}`);
    console.log('\n🏆 Top Systems:');
    topRankings.forEach((r, i) => {
        console.log(`   ${i + 1}. ${r.systemName}: ${r.avgAccuracy.toFixed(2)}% (${r.totalPredictions} predictions)`);
    });

    await prisma.$disconnect();
}

checkPerformances();
