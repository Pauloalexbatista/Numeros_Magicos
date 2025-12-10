import { prisma } from '../lib/prisma';
import { rankedSystems } from '../services/ranked-systems';

/**
 * Test Sistema Diamante (8 systems) without permanent implementation
 * Compare with Bronze (9 systems) to see if it's worth implementing
 */

async function testDiamondSystem() {
    console.log('💎 TESTE DO SISTEMA DIAMANTE (8 Sistemas)\n');
    console.log('═'.repeat(80));

    // Get all draws
    const allDraws = await prisma.draw.findMany({
        orderBy: { date: 'desc' }
    });

    console.log(`Total de sorteios: ${allDraws.length}\n`);

    // Get top 8 systems by avgAccuracy (excluding medal systems)
    const rankings = await prisma.systemRanking.findMany({
        where: {
            systemName: {
                notIn: ['Sistema Ouro', 'Sistema Prata', 'Sistema Bronze', 'Sistema Platina']
            }
        },
        orderBy: { avgAccuracy: 'desc' },
        take: 8
    });

    console.log('📋 TOP 8 SISTEMAS (para Diamante):\n');
    rankings.forEach((sys, i) => {
        console.log(`  ${i + 1}. ${sys.systemName} (${sys.avgAccuracy.toFixed(2)} acc)`);
    });

    // Create weights for Diamond (same logic as Bronze but with 8 systems)
    const weights: Record<string, number> = {};
    rankings.forEach(rank => {
        weights[rank.systemName] = rank.avgAccuracy / 50;
    });

    console.log('\n🔄 Testando Diamante em todos os sorteios históricos...\n');

    let diamondJackpots = 0;
    let antiDiamondJackpots = 0;
    let diamondTotalHits = 0;
    let antiDiamondTotalHits = 0;

    // Test on all draws (except first 100 for history)
    for (let i = 100; i < allDraws.length; i++) {
        const history = allDraws.slice(i + 1); // All draws before this one
        const actualDraw = allDraws[i];
        const actualNumbers = typeof actualDraw.numbers === 'string'
            ? JSON.parse(actualDraw.numbers)
            : actualDraw.numbers;

        // Simulate Diamond System (Ensemble Voting with Top 8)
        const votes: Record<number, number> = {};

        for (const systemName of Object.keys(weights)) {
            const system = rankedSystems.find(s => s.name === systemName);
            if (!system) continue;

            try {
                const predicted = await system.generateTop10(history as any[]);
                const weight = weights[systemName];

                predicted.forEach(num => {
                    votes[num] = (votes[num] || 0) + weight;
                });
            } catch (error) {
                // Skip system if it fails
            }
        }

        // Get Diamond prediction (top 25 by votes)
        const diamondPrediction = Object.entries(votes)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 25)
            .map(([num]) => parseInt(num));

        // Anti-Diamond (inverse)
        const allNums = Array.from({ length: 50 }, (_, i) => i + 1);
        const antiDiamondPrediction = allNums
            .filter(n => !diamondPrediction.includes(n))
            .slice(0, 25);

        // Count hits
        const diamondHits = diamondPrediction.filter(n => actualNumbers.includes(n)).length;
        const antiDiamondHits = antiDiamondPrediction.filter(n => actualNumbers.includes(n)).length;

        diamondTotalHits += diamondHits;
        antiDiamondTotalHits += antiDiamondHits;

        // Count jackpots (5/5)
        if (diamondHits === 5) diamondJackpots++;
        if (antiDiamondHits === 5) antiDiamondJackpots++;
    }

    const testedDraws = allDraws.length - 100;
    const diamondPrecision = (diamondJackpots / testedDraws) * 100;
    const antiDiamondPrecision = (antiDiamondJackpots / testedDraws) * 100;
    const diamondAvgHits = diamondTotalHits / (testedDraws * 5) * 100;
    const antiDiamondAvgHits = antiDiamondTotalHits / (testedDraws * 5) * 100;

    console.log('═'.repeat(80));
    console.log('\n📊 RESULTADOS DO TESTE\n');

    console.log('┌─────────────────────┬──────────┬──────────┬───────────┬──────────┐');
    console.log('│ Sistema             │ Jackpots │ Anti-JP  │ Precisão  │ Avg Hits │');
    console.log('├─────────────────────┼──────────┼──────────┼───────────┼──────────┤');

    // Diamond results
    console.log(`│ 💎 Diamante (8)     │ ${diamondJackpots.toString().padStart(8)} │ ${antiDiamondJackpots.toString().padStart(8)} │ ${diamondPrecision.toFixed(2).padStart(8)}% │ ${diamondAvgHits.toFixed(2).padStart(7)}% │`);

    // Get Bronze results for comparison
    const bronzeStats = await prisma.systemPrediction.findMany({
        where: { systemName: 'Sistema Bronze' }
    });

    const bronzeJackpots = bronzeStats.filter(p => p.jackpot).length;
    const bronzeAntiJackpots = bronzeStats.filter(p => p.antiJackpot).length;
    const bronzePrecision = (bronzeJackpots / bronzeStats.length) * 100;
    const bronzeAvgHits = bronzeStats.reduce((sum, p) => sum + p.hits, 0) / (bronzeStats.length * 5) * 100;

    console.log(`│ 🥉 Bronze (9)       │ ${bronzeJackpots.toString().padStart(8)} │ ${bronzeAntiJackpots.toString().padStart(8)} │ ${bronzePrecision.toFixed(2).padStart(8)}% │ ${bronzeAvgHits.toFixed(2).padStart(7)}% │`);

    console.log('└─────────────────────┴──────────┴──────────┴───────────┴──────────┘');

    // Comparison
    console.log('\n🔍 COMPARAÇÃO DIAMANTE vs BRONZE:\n');

    const jpDiff = diamondJackpots - bronzeJackpots;
    const precisionDiff = diamondPrecision - bronzePrecision;
    const hitsDiff = diamondAvgHits - bronzeAvgHits;

    console.log(`Diferença de Jackpots: ${jpDiff > 0 ? '+' : ''}${jpDiff} (${jpDiff > 0 ? '✅ Diamante melhor' : jpDiff < 0 ? '❌ Bronze melhor' : '➖ Empate'})`);
    console.log(`Diferença de Precisão: ${precisionDiff > 0 ? '+' : ''}${precisionDiff.toFixed(2)}%`);
    console.log(`Diferença de Avg Hits: ${hitsDiff > 0 ? '+' : ''}${hitsDiff.toFixed(2)}%`);

    // Recommendation
    console.log('\n💡 RECOMENDAÇÃO:\n');

    if (jpDiff > 2) {
        console.log('✅ IMPLEMENTAR Sistema Diamante!');
        console.log(`   Ganho significativo: +${jpDiff} jackpots`);
        console.log('   Vale a pena adicionar permanentemente ao sistema.');
    } else if (jpDiff > 0) {
        console.log('⚠️  Diamante é ligeiramente melhor, mas ganho marginal');
        console.log('   Considerar implementar se quiser otimização máxima.');
    } else if (jpDiff === 0) {
        console.log('➖ Empate técnico');
        console.log('   Bronze (9 sistemas) já está otimizado.');
        console.log('   Não há vantagem em reduzir para 8 sistemas.');
    } else {
        console.log('❌ NÃO implementar');
        console.log(`   Bronze é superior: ${Math.abs(jpDiff)} jackpots a mais`);
        console.log('   Manter Bronze como está.');
    }

    console.log('\n' + '═'.repeat(80));

    await prisma.$disconnect();
}

testDiamondSystem()
    .then(() => {
        console.log('\n✅ Teste concluído!');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n❌ Erro:', error);
        process.exit(1);
    });
