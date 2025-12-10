import { prisma } from '@/lib/prisma';
import { VortexPyramidSystem } from '@/services/vortex-pyramid';

/**
 * CORRECTED: Large-scale test of Anti-Vortex
 * Measure from MOST RECENT draws (matching production)
 */

async function testAntiVortexCorrected() {
    console.log('🌀 TESTE CORRIGIDO - ANTI-VORTEX PYRAMID (ÚLTIMOS SORTEIOS)\n');
    console.log('═'.repeat(80));

    const allDraws = await prisma.draw.findMany({
        orderBy: { date: 'desc' },
        select: { id: true, date: true, numbers: true }
    });

    console.log(`Total de sorteios disponíveis: ${allDraws.length}\n`);

    const sampleSizes = [100, 250, 500, 1000, 1250, 1500];
    const vortex = new VortexPyramidSystem();

    console.log('🔄 Testando ÚLTIMOS sorteios (como na produção)...\n');

    const results: Array<{
        size: number;
        vortexJackpots: number;
        antiVortexJackpots: number;
        vortexPrecision: number;
        antiVortexPrecision: number;
        expectedJackpots: number;
        zScore: number;
        pValue: number;
        significant: boolean;
    }> = [];

    for (const size of sampleSizes) {
        if (size > allDraws.length - 100) {
            console.log(`⚠️  Amostra ${size} excede dados disponíveis. Pulando...`);
            continue;
        }

        console.log(`Testando ÚLTIMOS ${size} sorteios...`);

        let vortexHits = 0;
        let antiVortexHits = 0;
        let vortexJackpots = 0;
        let antiVortexJackpots = 0;

        // Test MOST RECENT draws (index 0 to size-1)
        for (let i = 0; i < size; i++) {
            // Use 100 draws as history (draws AFTER current)
            const history = allDraws.slice(i + 1, i + 101);

            if (history.length < 100) break; // Not enough history

            const actualDraw = allDraws[i];
            const actualNumbers = typeof actualDraw.numbers === 'string'
                ? JSON.parse(actualDraw.numbers)
                : actualDraw.numbers;

            // Get Vortex prediction
            const vortexPred = await vortex.generateTop10(history as any[]);

            // Anti-Vortex = opposite of Vortex
            const allNums = Array.from({ length: 50 }, (_, i) => i + 1);
            const antiVortexPred = allNums.filter(n => !vortexPred.includes(n)).slice(0, 25);

            // Count hits for Vortex
            const vHits = vortexPred.filter(n => actualNumbers.includes(n)).length;
            vortexHits += vHits;
            if (vHits === 5) vortexJackpots++;

            // Count hits for Anti-Vortex
            const avHits = antiVortexPred.filter(n => actualNumbers.includes(n)).length;
            antiVortexHits += avHits;
            if (avHits === 5) antiVortexJackpots++;
        }

        const vortexPrecision = (vortexHits / (size * 5)) * 100;
        const antiVortexPrecision = (antiVortexHits / (size * 5)) * 100;

        // Statistical Analysis for Anti-Vortex
        const expectedRate = 2.507; // % (random probability)
        const expectedJackpots = (expectedRate / 100) * size;

        const p = expectedRate / 100;
        const n = size;
        const observed = antiVortexJackpots;
        const expected = expectedJackpots;

        const variance = n * p * (1 - p);
        const stdDev = Math.sqrt(variance);
        const zScore = stdDev > 0 ? (observed - expected) / stdDev : 0;

        const pValue = zScore > 0 ? 1 - normalCDF(zScore) : 0.5;
        const significant = pValue < 0.05;

        results.push({
            size,
            vortexJackpots,
            antiVortexJackpots,
            vortexPrecision,
            antiVortexPrecision,
            expectedJackpots,
            zScore,
            pValue,
            significant
        });
    }

    // Display results
    console.log('\n' + '═'.repeat(80));
    console.log('\n📊 RESULTADOS (ÚLTIMOS SORTEIOS)\n');

    console.log('┌─────────┬──────────┬──────────┬──────────┬──────────┬──────────┐');
    console.log('│ Amostra │ Vortex   │ Anti-V   │ Esperado │ Z-Score  │ Signif.  │');
    console.log('│         │ JP/Prec  │ JP/Prec  │ (Anti-V) │ (Anti-V) │          │');
    console.log('├─────────┼──────────┼──────────┼──────────┼──────────┼──────────┤');

    results.forEach(r => {
        const size = r.size.toString().padStart(7, ' ');
        const vortex = `${r.vortexJackpots}/${r.vortexPrecision.toFixed(1)}%`.padStart(8, ' ');
        const antiV = `${r.antiVortexJackpots}/${r.antiVortexPrecision.toFixed(1)}%`.padStart(8, ' ');
        const exp = r.expectedJackpots.toFixed(1).padStart(8, ' ');
        const z = r.zScore.toFixed(2).padStart(8, ' ');
        const sig = (r.significant ? '✅ SIM' : '❌ NÃO').padStart(8, ' ');

        console.log(`│ ${size} │ ${vortex} │ ${antiV} │ ${exp} │ ${z} │ ${sig} │`);
    });

    console.log('└─────────┴──────────┴──────────┴──────────┴──────────┴──────────┘');

    // Detailed analysis for each sample
    console.log('\n📈 ANÁLISE DETALHADA\n');

    results.forEach(r => {
        console.log(`═══ Amostra ${r.size} ═══`);
        console.log(`\nVortex Pyramid:`);
        console.log(`  Jackpots: ${r.vortexJackpots} (${((r.vortexJackpots / r.size) * 100).toFixed(1)}%)`);
        console.log(`  Precisão: ${r.vortexPrecision.toFixed(1)}%`);

        console.log(`\nAnti-Vortex Pyramid:`);
        console.log(`  Jackpots: ${r.antiVortexJackpots} (${((r.antiVortexJackpots / r.size) * 100).toFixed(1)}%)`);
        console.log(`  Precisão: ${r.antiVortexPrecision.toFixed(1)}%`);
        console.log(`  Esperado (aleatório): ${r.expectedJackpots.toFixed(1)} jackpots`);
        console.log(`  Diferença: ${(r.antiVortexJackpots - r.expectedJackpots).toFixed(1)} (${((r.antiVortexJackpots / r.expectedJackpots - 1) * 100).toFixed(1)}%)`);
        console.log(`  Z-Score: ${r.zScore.toFixed(2)}`);
        console.log(`  P-Value: ${r.pValue.toFixed(4)}`);

        if (r.significant) {
            console.log(`  ✅ ESTATISTICAMENTE SIGNIFICATIVO!`);
            console.log(`     Anti-Vortex está ACIMA do esperado (95% confiança)!`);
        } else {
            console.log(`  ⚠️  Não significativo estatisticamente`);
        }
        console.log('');
    });

    // Overall conclusion
    console.log('═'.repeat(80));
    console.log('\n💡 CONCLUSÃO FINAL\n');

    const first100 = results.find(r => r.size === 100);
    if (first100) {
        console.log(`Últimos 100 sorteios (como na produção):`);
        console.log(`  Vortex: ${first100.vortexJackpots} jackpots`);
        console.log(`  Anti-Vortex: ${first100.antiVortexJackpots} jackpots`);
        console.log(`  Esperado: ${first100.expectedJackpots.toFixed(1)} jackpots`);

        if (first100.antiVortexJackpots === 10) {
            console.log(`\n✅ CONFIRMADO! Anti-Vortex tem 10 jackpots (como na produção)!`);
        } else {
            console.log(`\n⚠️  Discrepância: Produção mostra 10, teste mostra ${first100.antiVortexJackpots}`);
        }
    }

    const significantResults = results.filter(r => r.significant);

    if (significantResults.length > 0) {
        console.log(`\n✅ ${significantResults.length}/${results.length} amostras são estatisticamente significativas!`);
        console.log('Anti-Vortex está PROVADAMENTE acima do esperado!\n');
    } else {
        console.log(`\n⚠️  Nenhuma amostra é estatisticamente significativa (p < 0.05)`);
        console.log('Pode precisar de mais dados ou há variação temporal.\n');
    }

    console.log('═'.repeat(80));
}

// Normal CDF approximation
function normalCDF(z: number): number {
    const t = 1 / (1 + 0.2316419 * Math.abs(z));
    const d = 0.3989423 * Math.exp(-z * z / 2);
    const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    return z > 0 ? 1 - p : p;
}

testAntiVortexCorrected()
    .then(() => {
        console.log('\n✅ Teste concluído!');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n❌ Erro:', error);
        process.exit(1);
    });
