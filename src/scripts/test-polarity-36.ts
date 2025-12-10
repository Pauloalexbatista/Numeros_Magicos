import { prisma } from '../lib/prisma';
import { Polarity36System } from '../services/polarity-36-system';

/**
 * Testa o Sistema Polaridade 3-6
 * Compara com performance aleatória
 */

async function testPolarity36System() {
    console.log('🎯 TESTE: Sistema Polaridade 3-6 (Tesla-Rodin)\n');
    console.log('═'.repeat(80));

    const allDraws = await prisma.draw.findMany({
        orderBy: { date: 'asc' }
    });

    console.log(`Total de sorteios: ${allDraws.length}\n`);

    const system = new Polarity36System();

    let jackpots = 0;
    let antiJackpots = 0;
    let totalHits = 0;
    let antiTotalHits = 0;

    const testSize = allDraws.length - 100;

    console.log('🔄 Testando sistema...\n');

    for (let i = 100; i < allDraws.length; i++) {
        const history = allDraws.slice(0, i);
        const actualDraw = allDraws[i];
        const actualNumbers = typeof actualDraw.numbers === 'string'
            ? JSON.parse(actualDraw.numbers)
            : actualDraw.numbers;

        // Previsão do sistema
        const prediction = await system.generateTop10(history as any[]);

        // Anti-previsão
        const allNums = Array.from({ length: 50 }, (_, i) => i + 1);
        const antiPrediction = allNums.filter(n => !prediction.includes(n)).slice(0, 25);

        // Contar hits
        const hits = prediction.filter(n => actualNumbers.includes(n)).length;
        const antiHits = antiPrediction.filter(n => actualNumbers.includes(n)).length;

        totalHits += hits;
        antiTotalHits += antiHits;

        if (hits === 5) jackpots++;
        if (antiHits === 5) antiJackpots++;

        // Progress
        if ((i - 100) % 200 === 0) {
            console.log(`  Processados: ${i - 100}/${testSize} sorteios...`);
        }
    }

    // Estatísticas
    const precision = (jackpots / testSize) * 100;
    const antiPrecision = (antiJackpots / testSize) * 100;
    const avgHits = (totalHits / (testSize * 5)) * 100;
    const antiAvgHits = (antiTotalHits / (testSize * 5)) * 100;

    console.log('\n' + '═'.repeat(80));
    console.log('\n📊 RESULTADOS\n');

    console.log('┌─────────────────────────┬──────────┬──────────┬───────────┬──────────┐');
    console.log('│ Sistema                 │ Jackpots │ Anti-JP  │ Precisão  │ Avg Hits │');
    console.log('├─────────────────────────┼──────────┼──────────┼───────────┼──────────┤');
    console.log(`│ 🎯 Polaridade 3-6       │ ${jackpots.toString().padStart(8)} │ ${antiJackpots.toString().padStart(8)} │ ${precision.toFixed(2).padStart(8)}% │ ${avgHits.toFixed(2).padStart(7)}% │`);
    console.log('└─────────────────────────┴──────────┴──────────┴───────────┴──────────┘');

    console.log('\n🔍 COMPARAÇÃO COM OUTROS SISTEMAS:\n');

    // Benchmarks conhecidos
    const benchmarks = [
        { name: 'Sistema Bronze', jps: 66, precision: 3.57 },
        { name: 'Vortex 2-Canal', jps: 62, precision: 3.44 },
        { name: 'Sistema Prata', jps: 64, precision: 3.46 },
        { name: 'Vortex 3-Canal', jps: 54, precision: 3.00 },
        { name: 'Anti-Vortex 3-Canal', jps: 49, precision: 2.72 }
    ];

    benchmarks.forEach(b => {
        const diff = jackpots - b.jps;
        const symbol = diff > 0 ? '✅' : diff < 0 ? '❌' : '➖';
        console.log(`  ${b.name}: ${b.jps} JPs (${b.precision}%) ${symbol} ${diff > 0 ? '+' : ''}${diff}`);
    });

    console.log('\n💡 ANÁLISE:\n');

    if (jackpots >= 60) {
        console.log('✅ EXCELENTE! Sistema Polaridade 3-6 está no TOP 3!');
        console.log('   Recomendação: IMPLEMENTAR permanentemente');
    } else if (jackpots >= 50) {
        console.log('✅ BOM! Sistema tem performance competitiva');
        console.log('   Recomendação: Considerar para ensemble');
    } else if (jackpots >= 40) {
        console.log('⚠️  MÉDIO. Sistema funciona mas não é top-tier');
        console.log('   Recomendação: Usar como componente de ensemble');
    } else {
        console.log('❌ FRACO. Teoria interessante mas performance baixa');
        console.log('   Recomendação: Não implementar como sistema principal');
    }

    console.log('\n' + '═'.repeat(80));

    await prisma.$disconnect();
}

testPolarity36System()
    .then(() => {
        console.log('\n✅ Teste concluído!');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n❌ Erro:', error);
        process.exit(1);
    });
