// Script temporário para analisar todos os sistemas na BD
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function analyzeSystems() {
    console.log('📊 ANÁLISE DA BASE DE DADOS - SISTEMAS\n');
    console.log('='.repeat(60));

    try {
        // 1. Sistemas de Números Rankings
        console.log('\n🔢 SISTEMAS DE NÚMEROS (SystemRanking):');
        console.log('-'.repeat(60));

        const numberRankings = await prisma.systemRanking.findMany({
            orderBy: { avgAccuracy: 'desc' },
            include: { system: true }
        });

        console.log(`Total: ${numberRankings.length} sistemas\n`);

        numberRankings.forEach((ranking, i) => {
            console.log(`${i + 1}. ${ranking.systemName}`);
            console.log(`   Accuracy médio: ${ranking.avgAccuracy.toFixed(2)}%`);
            console.log(`   Previsões: ${ranking.totalPredictions}`);
            console.log(`   Ativo: ${ranking.system?.isActive ? 'Sim' : 'Não'}`);
            console.log('');
        });

        // 2. Sistemas de Estrelas
        console.log('\n⭐ SISTEMAS DE ESTRELAS (StarSystemRanking):');
        console.log('-'.repeat(60));

        const starRankings = await prisma.starSystemRanking.findMany({
            orderBy: { avgAccuracy: 'desc' }
        });

        console.log(`Total: ${starRankings.length} sistemas\n`);

        starRankings.forEach((ranking, i) => {
            console.log(`${i + 1}. ${ranking.systemName}`);
            console.log(`   Accuracy médio: ${ranking.avgAccuracy.toFixed(2)}%`);
            console.log(`   Previsões: ${ranking.totalPredictions}`);
            console.log('');
        });

        // 3. Resumo Geral
        console.log('\n📋 RESUMO GERAL:');
        console.log('-'.repeat(60));

        const drawsCount = await prisma.draw.count();
        const usersCount = await prisma.user.count();
        const allSystems = await prisma.rankedSystem.count();

        console.log(`Sorteios: ${drawsCount}`);
        console.log(`Utilizadores: ${usersCount}`);
        console.log(`Sistemas cadastrados: ${allSystems}`);
        console.log(`Com ranking (números): ${numberRankings.length}`);
        console.log(`Com ranking (estrelas): ${starRankings.length}`);

        // 4. Top Performers
        console.log('\n🏆 TOP 5 NÚMEROS (por accuracy):');
        console.log('-'.repeat(60));

        numberRankings.slice(0, 5).forEach((r, i) => {
            console.log(`${i + 1}. ${r.systemName} - ${r.avgAccuracy.toFixed(2)}% (${r.totalPredictions} previsões)`);
        });

        console.log('\n🏆 TOP 5 ESTRELAS (por accuracy):');
        console.log('-'.repeat(60));

        starRankings.slice(0, 5).forEach((r, i) => {
            console.log(`${i + 1}. ${r.systemName} - ${r.avgAccuracy.toFixed(2)}% (${r.totalPredictions} previsões)`);
        });

        console.log('\n' + '='.repeat(60));
        console.log('✅ Análise completa!');

    } catch (error) {
        console.error('❌ Erro:', error.message);
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

analyzeSystems();
