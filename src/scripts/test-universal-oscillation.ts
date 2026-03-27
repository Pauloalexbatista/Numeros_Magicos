import { prisma } from '../lib/prisma';
import { UniversalOscillationSystem } from '../services/universal-oscillation-system';

/**
 * Testa o Sistema de Oscilação Universal
 * Compara com benchmarks conhecidos
 */

async function testUniversalOscillation() {
    console.log('🎯 TESTE: Sistema Oscilação Universal\n');
    console.log('═'.repeat(80));

    const allDraws = await prisma.draw.findMany({
        orderBy: { date: 'asc' }
    });

    console.log(`Total de sorteios: ${allDraws.length}\n`);

    const system = new UniversalOscillationSystem();

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
            ? (typeof actualDraw.numbers === "string" ? JSON.parse(actualDraw.numbers) : actualDraw.numbers)
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
    console.log(`│ 🌀 Oscilação Universal  │ ${jackpots.toString().padStart(8)} │ ${antiJackpots.toString().padStart(8)} │ ${precision.toFixed(2).padStart(8)}% │ ${avgHits.toFixed(2).padStart(7)}% │`);
    console.log('└─────────────────────────┴──────────┴──────────┴───────────┴──────────┘');

    console.log('\n🔍 COMPARAÇÃO COM OUTROS SISTEMAS:\n');

    // Benchmarks conhecidos
    const benchmarks = [
        { name: 'Sistema Bronze', jps: 66, precision: 3.57 },
        { name: 'Vortex 2-Canal', jps: 62, precision: 3.44 },
        { name: 'Sistema Prata', jps: 64, precision: 3.46 },
        { name: 'Polaridade 3-6', jps: 57, precision: 3.17 },
        { name: 'Vortex 3-Canal', jps: 54, precision: 3.00 }
    ];

    benchmarks.forEach(b => {
        const diff = jackpots - b.jps;
        const symbol = diff > 0 ? '✅' : diff < 0 ? '❌' : '➖';
        console.log(`  ${b.name}: ${b.jps} JPs (${b.precision}%) ${symbol} ${diff > 0 ? '+' : ''}${diff}`);
    });

    console.log('\n💡 ANÁLISE:\n');

    if (jackpots >= 66) {
        console.log('🏆 EXCELENTE! Oscilação Universal SUPERA Bronze!');
        console.log('   Recomendação: IMPLEMENTAR como sistema principal');
    } else if (jackpots >= 60) {
        console.log('✅ MUITO BOM! Sistema está no TOP 3!');
        console.log('   Recomendação: IMPLEMENTAR permanentemente');
    } else if (jackpots >= 55) {
        console.log('✅ BOM! Sistema tem performance competitiva');
        console.log('   Recomendação: Considerar para ensemble');
    } else if (jackpots >= 50) {
        console.log('⚠️  MÉDIO. Sistema funciona mas não é top-tier');
        console.log('   Recomendação: Usar como componente de ensemble');
    } else {
        console.log('❌ FRACO. Performance abaixo do esperado');
        console.log('   Recomendação: Revisar algoritmo');
    }

    // Exemplo de análise de saturação
    console.log('\n' + '═'.repeat(80));
    console.log('\n🔬 EXEMPLO: Análise de Saturação (Último Sorteio)\n');

    const analysis = await system.analyzeSaturation(allDraws as any[]);

    console.log('Frequência de raízes (últimos 10 sorteios):');
    for (let i = 1; i <= 9; i++) {
        const freq = analysis.rootFrequency[i] || 0;
        const sat = analysis.saturation[i] || 0;
        const status = sat < 0.8 ? '🔵 CARENTE' : sat > 1.2 ? '🔴 SATURADA' : '⚪ NORMAL';
        console.log(`  Raiz ${i}: ${freq} vezes (saturação: ${sat.toFixed(2)}) ${status}`);
    }

    console.log(`\n📋 Números recomendados (raízes carentes):`);
    console.log(`   ${analysis.recommendation.slice(0, 10).join(', ')}...`);

    console.log('\n' + '═'.repeat(80));

    await prisma.$disconnect();
}

testUniversalOscillation()
    .then(() => {
        console.log('\n✅ Teste concluído!');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n❌ Erro:', error);
        process.exit(1);
    });
