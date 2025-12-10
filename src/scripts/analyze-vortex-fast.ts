import * as fs from 'fs';
import * as path from 'path';

/**
 * Fast analysis using pre-calculated predictions
 * Analyze different sample sizes instantly!
 */

interface VortexPrediction {
    drawId: number;
    date: string;
    actualNumbers: number[];
    vortexPrediction: number[];
    antiVortexPrediction: number[];
    vortexHits: number;
    antiVortexHits: number;
    vortexJackpot: boolean;
    antiVortexJackpot: boolean;
}

function normalCDF(z: number): number {
    const t = 1 / (1 + 0.2316419 * Math.abs(z));
    const d = 0.3989423 * Math.exp(-z * z / 2);
    const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
    return z > 0 ? 1 - p : p;
}

async function analyzeVortexFast() {
    console.log('⚡ ANÁLISE RÁPIDA - VORTEX PREDICTIONS\n');
    console.log('═'.repeat(80));

    // Load pre-calculated data
    const dataPath = path.join(process.cwd(), 'data', 'vortex-predictions.json');

    if (!fs.existsSync(dataPath)) {
        console.log('❌ Ficheiro não encontrado!');
        console.log('   Execute primeiro: npx tsx src/scripts/precalculate-vortex.ts');
        return;
    }

    const data: VortexPrediction[] = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

    console.log(`📁 Carregados ${data.length} sorteios pré-calculados\n`);

    // Analyze different sample sizes
    const sampleSizes = [100, 250, 500, 1000, 1250, 1500, 1800];

    console.log('📊 ANÁLISE POR TAMANHO DE AMOSTRA\n');
    console.log('┌─────────┬──────────┬──────────┬──────────┬──────────┬──────────┐');
    console.log('│ Amostra │ Anti-V   │ Esperado │ Difer.   │ Z-Score  │ Signif.  │');
    console.log('│         │ JP/Prec  │ JP       │ %        │          │          │');
    console.log('├─────────┼──────────┼──────────┼──────────┼──────────┼──────────┤');

    const results: Array<{
        size: number;
        antiJP: number;
        antiPrec: number;
        expected: number;
        diff: number;
        zScore: number;
        pValue: number;
        significant: boolean;
    }> = [];

    for (const size of sampleSizes) {
        if (size > data.length) continue;

        // Take MOST RECENT draws (first N in array, since it's ordered desc)
        const sample = data.slice(0, size);

        const antiJP = sample.filter(p => p.antiVortexJackpot).length;
        const antiHits = sample.reduce((sum, p) => sum + p.antiVortexHits, 0);
        const antiPrec = (antiHits / (size * 5)) * 100;

        // Statistical analysis
        const expectedRate = 2.507; // %
        const expected = (expectedRate / 100) * size;
        const diff = ((antiJP / expected - 1) * 100);

        const p = expectedRate / 100;
        const variance = size * p * (1 - p);
        const stdDev = Math.sqrt(variance);
        const zScore = stdDev > 0 ? (antiJP - expected) / stdDev : 0;
        const pValue = zScore > 0 ? 1 - normalCDF(zScore) : 0.5;
        const significant = pValue < 0.05;

        results.push({
            size,
            antiJP,
            antiPrec,
            expected,
            diff,
            zScore,
            pValue,
            significant
        });

        const sizeStr = size.toString().padStart(7, ' ');
        const jpPrec = `${antiJP}/${antiPrec.toFixed(1)}%`.padStart(8, ' ');
        const exp = expected.toFixed(1).padStart(8, ' ');
        const diffStr = `${diff > 0 ? '+' : ''}${diff.toFixed(1)}%`.padStart(8, ' ');
        const z = zScore.toFixed(2).padStart(8, ' ');
        const sig = (significant ? '✅ SIM' : '❌ NÃO').padStart(8, ' ');

        console.log(`│ ${sizeStr} │ ${jpPrec} │ ${exp} │ ${diffStr} │ ${z} │ ${sig} │`);
    }

    console.log('└─────────┴──────────┴──────────┴──────────┴──────────┴──────────┘');

    // Detailed analysis
    console.log('\n📈 ANÁLISE ESTATÍSTICA DETALHADA\n');

    results.forEach(r => {
        console.log(`═══ Amostra ${r.size} ═══`);
        console.log(`Jackpots: ${r.antiJP} (observado) vs ${r.expected.toFixed(1)} (esperado)`);
        console.log(`Diferença: ${r.diff > 0 ? '+' : ''}${r.diff.toFixed(1)}%`);
        console.log(`Z-Score: ${r.zScore.toFixed(2)}`);
        console.log(`P-Value: ${r.pValue.toFixed(4)}`);

        if (r.significant) {
            console.log(`✅ ESTATISTICAMENTE SIGNIFICATIVO! (95% confiança)`);
            if (r.zScore > 2) {
                console.log(`   💪 Evidência FORTE (Z > 2)`);
            } else {
                console.log(`   ⚠️  Evidência moderada (Z < 2)`);
            }
        } else {
            console.log(`❌ Não significativo (pode ser variação aleatória)`);
        }
        console.log('');
    });

    // Overall conclusion
    console.log('═'.repeat(80));
    console.log('\n💡 CONCLUSÃO FINAL\n');

    const significantResults = results.filter(r => r.significant);
    const allPositive = results.every(r => r.antiJP >= r.expected);

    if (significantResults.length > 0) {
        console.log(`✅ ${significantResults.length}/${results.length} amostras são estatisticamente significativas!`);
        console.log('\n🎯 Anti-Vortex Pyramid está PROVADAMENTE acima do esperado!\n');

        const best = results.reduce((max, r) => r.zScore > max.zScore ? r : max, results[0]);
        console.log(`Melhor resultado: ${best.size} sorteios`);
        console.log(`  ${best.antiJP} jackpots vs ${best.expected.toFixed(1)} esperados`);
        console.log(`  Z-Score: ${best.zScore.toFixed(2)}`);
        console.log(`  Diferença: +${best.diff.toFixed(1)}%`);
    } else if (allPositive) {
        console.log('⚠️  Nenhuma amostra é estatisticamente significativa (p < 0.05)');
        console.log('MAS todas as amostras têm mais jackpots que o esperado!');
        console.log('\n💡 Pode indicar efeito real mas fraco, ou precisar de mais dados.');
    } else {
        console.log('❌ Resultados inconsistentes.');
        console.log('Anti-Vortex não mostra vantagem clara sobre aleatório.');
    }

    // Comparison with production (100 draws showing 10 jackpots)
    const first100 = results.find(r => r.size === 100);
    if (first100) {
        console.log('\n📊 COMPARAÇÃO COM PRODUÇÃO (últimos 100):\n');
        console.log(`Produção mostra: 10 jackpots`);
        console.log(`Análise mostra: ${first100.antiJP} jackpots`);

        if (Math.abs(first100.antiJP - 10) <= 2) {
            console.log(`✅ CONFIRMADO! Valores muito próximos!`);
        } else {
            console.log(`⚠️  Discrepância: ${Math.abs(first100.antiJP - 10)} jackpots de diferença`);
            console.log(`   Pode ser período diferente ou configuração diferente.`);
        }
    }

    console.log('\n' + '═'.repeat(80));
}

analyzeVortexFast()
    .then(() => {
        console.log('\n✅ Análise concluída!');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n❌ Erro:', error);
        process.exit(1);
    });
