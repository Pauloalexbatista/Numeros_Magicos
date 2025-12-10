import { prisma } from '../lib/prisma';
import { VortexPyramidSystem } from '../services/vortex-pyramid';
import { VortexMultiChannelSystem } from '../services/vortex-multichannel';

/**
 * Test Vortex Multi-Channel (2 and 3 channels) vs Original Vortex
 * Compare performance to see if multi-channel approach improves results
 */

async function testVortexMultiChannel() {
    console.log('🌀 TESTE VORTEX MULTI-CANAL\n');
    console.log('═'.repeat(80));

    // Get all draws
    const allDraws = await prisma.draw.findMany({
        orderBy: { date: 'desc' }
    });

    console.log(`Total de sorteios: ${allDraws.length}\n`);

    // Initialize systems
    const vortexOriginal = new VortexPyramidSystem();
    const vortex2Channel = new VortexMultiChannelSystem(2);
    const vortex3Channel = new VortexMultiChannelSystem(3);

    console.log('🔧 Sistemas a testar:\n');
    console.log(`  1. ${vortexOriginal.name}`);
    console.log(`  2. ${vortex2Channel.name}`);
    console.log(`  3. ${vortex3Channel.name}`);

    console.log('\n🔄 Testando em todos os sorteios históricos...\n');

    const results = {
        original: { jackpots: 0, antiJackpots: 0, totalHits: 0, antiTotalHits: 0 },
        channel2: { jackpots: 0, antiJackpots: 0, totalHits: 0, antiTotalHits: 0 },
        channel3: { jackpots: 0, antiJackpots: 0, totalHits: 0, antiTotalHits: 0 }
    };

    // Test on all draws (except first 100 for history)
    const testSize = allDraws.length - 100;

    for (let i = 100; i < allDraws.length; i++) {
        const history = allDraws.slice(i + 1); // All draws before this one
        const actualDraw = allDraws[i];
        const actualNumbers = typeof actualDraw.numbers === 'string'
            ? JSON.parse(actualDraw.numbers)
            : actualDraw.numbers;

        // Test Original Vortex
        const originalPred = await vortexOriginal.generateTop10(history as any[]);
        const originalHits = originalPred.filter(n => actualNumbers.includes(n)).length;
        results.original.totalHits += originalHits;
        if (originalHits === 5) results.original.jackpots++;

        // Anti-Original
        const allNums = Array.from({ length: 50 }, (_, i) => i + 1);
        const antiOriginalPred = allNums.filter(n => !originalPred.includes(n)).slice(0, 25);
        const antiOriginalHits = antiOriginalPred.filter(n => actualNumbers.includes(n)).length;
        results.original.antiTotalHits += antiOriginalHits;
        if (antiOriginalHits === 5) results.original.antiJackpots++;

        // Test 2-Channel
        const channel2Pred = await vortex2Channel.generateTop10(history as any[]);
        const channel2Hits = channel2Pred.filter(n => actualNumbers.includes(n)).length;
        results.channel2.totalHits += channel2Hits;
        if (channel2Hits === 5) results.channel2.jackpots++;

        // Anti-2-Channel
        const antiChannel2Pred = allNums.filter(n => !channel2Pred.includes(n)).slice(0, 25);
        const antiChannel2Hits = antiChannel2Pred.filter(n => actualNumbers.includes(n)).length;
        results.channel2.antiTotalHits += antiChannel2Hits;
        if (antiChannel2Hits === 5) results.channel2.antiJackpots++;

        // Test 3-Channel
        const channel3Pred = await vortex3Channel.generateTop10(history as any[]);
        const channel3Hits = channel3Pred.filter(n => actualNumbers.includes(n)).length;
        results.channel3.totalHits += channel3Hits;
        if (channel3Hits === 5) results.channel3.jackpots++;

        // Anti-3-Channel
        const antiChannel3Pred = allNums.filter(n => !channel3Pred.includes(n)).slice(0, 25);
        const antiChannel3Hits = antiChannel3Pred.filter(n => actualNumbers.includes(n)).length;
        results.channel3.antiTotalHits += antiChannel3Hits;
        if (antiChannel3Hits === 5) results.channel3.antiJackpots++;

        // Progress indicator
        if ((i - 100) % 200 === 0) {
            console.log(`  Processados: ${i - 100}/${testSize} sorteios...`);
        }
    }

    // Calculate metrics
    const metrics = {
        original: {
            precision: (results.original.jackpots / testSize) * 100,
            antiPrecision: (results.original.antiJackpots / testSize) * 100,
            avgHits: (results.original.totalHits / (testSize * 5)) * 100,
            antiAvgHits: (results.original.antiTotalHits / (testSize * 5)) * 100
        },
        channel2: {
            precision: (results.channel2.jackpots / testSize) * 100,
            antiPrecision: (results.channel2.antiJackpots / testSize) * 100,
            avgHits: (results.channel2.totalHits / (testSize * 5)) * 100,
            antiAvgHits: (results.channel2.antiTotalHits / (testSize * 5)) * 100
        },
        channel3: {
            precision: (results.channel3.jackpots / testSize) * 100,
            antiPrecision: (results.channel3.antiJackpots / testSize) * 100,
            avgHits: (results.channel3.totalHits / (testSize * 5)) * 100,
            antiAvgHits: (results.channel3.antiTotalHits / (testSize * 5)) * 100
        }
    };

    console.log('\n' + '═'.repeat(80));
    console.log('\n📊 RESULTADOS COMPARATIVOS\n');

    console.log('┌──────────────────────┬──────────┬──────────┬───────────┬──────────┐');
    console.log('│ Sistema              │ Jackpots │ Anti-JP  │ Precisão  │ Avg Hits │');
    console.log('├──────────────────────┼──────────┼──────────┼───────────┼──────────┤');

    // Original
    console.log(`│ 🌀 Vortex Original   │ ${results.original.jackpots.toString().padStart(8)} │ ${results.original.antiJackpots.toString().padStart(8)} │ ${metrics.original.precision.toFixed(2).padStart(8)}% │ ${metrics.original.avgHits.toFixed(2).padStart(7)}% │`);

    // 2-Channel
    console.log(`│ 🌊 Vortex 2-Canal    │ ${results.channel2.jackpots.toString().padStart(8)} │ ${results.channel2.antiJackpots.toString().padStart(8)} │ ${metrics.channel2.precision.toFixed(2).padStart(8)}% │ ${metrics.channel2.avgHits.toFixed(2).padStart(7)}% │`);

    // 3-Channel
    console.log(`│ 🌊🌊 Vortex 3-Canal  │ ${results.channel3.jackpots.toString().padStart(8)} │ ${results.channel3.antiJackpots.toString().padStart(8)} │ ${metrics.channel3.precision.toFixed(2).padStart(8)}% │ ${metrics.channel3.avgHits.toFixed(2).padStart(7)}% │`);

    console.log('└──────────────────────┴──────────┴──────────┴───────────┴──────────┘');

    // Comparisons
    console.log('\n🔍 COMPARAÇÕES:\n');

    const jp2Diff = results.channel2.jackpots - results.original.jackpots;
    const jp3Diff = results.channel3.jackpots - results.original.jackpots;
    const antiJp2Diff = results.channel2.antiJackpots - results.original.antiJackpots;
    const antiJp3Diff = results.channel3.antiJackpots - results.original.antiJackpots;

    console.log('**2-Canal vs Original:**');
    console.log(`  Jackpots: ${jp2Diff > 0 ? '+' : ''}${jp2Diff} (${jp2Diff > 0 ? '✅' : jp2Diff < 0 ? '❌' : '➖'})`);
    console.log(`  Anti-JP:  ${antiJp2Diff > 0 ? '+' : ''}${antiJp2Diff} (${antiJp2Diff > 0 ? '✅' : antiJp2Diff < 0 ? '❌' : '➖'})`);

    console.log('\n**3-Canal vs Original:**');
    console.log(`  Jackpots: ${jp3Diff > 0 ? '+' : ''}${jp3Diff} (${jp3Diff > 0 ? '✅' : jp3Diff < 0 ? '❌' : '➖'})`);
    console.log(`  Anti-JP:  ${antiJp3Diff > 0 ? '+' : ''}${antiJp3Diff} (${antiJp3Diff > 0 ? '✅' : antiJp3Diff < 0 ? '❌' : '➖'})`);

    console.log('\n**3-Canal vs 2-Canal:**');
    const jp32Diff = results.channel3.jackpots - results.channel2.jackpots;
    const antiJp32Diff = results.channel3.antiJackpots - results.channel2.antiJackpots;
    console.log(`  Jackpots: ${jp32Diff > 0 ? '+' : ''}${jp32Diff} (${jp32Diff > 0 ? '✅ 3-Canal melhor' : jp32Diff < 0 ? '❌ 2-Canal melhor' : '➖ Empate'})`);
    console.log(`  Anti-JP:  ${antiJp32Diff > 0 ? '+' : ''}${antiJp32Diff} (${antiJp32Diff > 0 ? '✅ 3-Canal melhor' : antiJp32Diff < 0 ? '❌ 2-Canal melhor' : '➖ Empate'})`);

    // Recommendation
    console.log('\n💡 RECOMENDAÇÃO:\n');

    const bestJackpots = Math.max(results.original.jackpots, results.channel2.jackpots, results.channel3.jackpots);
    const bestAntiJackpots = Math.max(results.original.antiJackpots, results.channel2.antiJackpots, results.channel3.antiJackpots);

    let bestSystem = 'Original';
    let bestAntiSystem = 'Original';

    if (results.channel2.jackpots === bestJackpots) bestSystem = '2-Canal';
    if (results.channel3.jackpots === bestJackpots) bestSystem = '3-Canal';
    if (results.channel2.antiJackpots === bestAntiJackpots) bestAntiSystem = '2-Canal';
    if (results.channel3.antiJackpots === bestAntiJackpots) bestAntiSystem = '3-Canal';

    console.log(`🏆 Melhor para Jackpots: Vortex ${bestSystem} (${bestJackpots} JPs)`);
    console.log(`🏆 Melhor para Anti-Jackpots: Anti-Vortex ${bestAntiSystem} (${bestAntiJackpots} JPs)`);

    if (bestSystem !== 'Original' || bestAntiSystem !== 'Original') {
        console.log('\n✅ Multi-Canal mostra vantagem!');
        console.log(`   Implementar: Vortex ${bestSystem === bestAntiSystem ? bestSystem : bestSystem + ' e ' + bestAntiSystem}`);
    } else {
        console.log('\n⚠️  Original ainda é competitivo');
        console.log('   Considerar manter Original ou testar outros pesos');
    }

    console.log('\n' + '═'.repeat(80));

    await prisma.$disconnect();
}

testVortexMultiChannel()
    .then(() => {
        console.log('\n✅ Teste concluído!');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n❌ Erro:', error);
        process.exit(1);
    });
