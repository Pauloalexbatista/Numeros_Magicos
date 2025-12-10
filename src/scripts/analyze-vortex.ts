import { prisma } from '@/lib/prisma';
import { VortexPyramidSystem } from '@/services/vortex-pyramid';

/**
 * Validate and visualize Vortex Pyramid calculations
 */

async function analyzeVortex() {
    console.log('🌀 ANÁLISE DO SISTEMA VORTEX PYRAMID\n');
    console.log('═'.repeat(80));

    const draws = await prisma.draw.findMany({
        orderBy: { date: 'desc' },
        take: 100,
        select: { numbers: true }
    });

    console.log(`Analisando últimos ${draws.length} sorteios\n`);

    const vortex = new VortexPyramidSystem();
    const resonance = vortex.analyzeResonance(draws as any[]);

    // Show top 10 and bottom 10
    console.log('🔝 TOP 10 NÚMEROS (Maior Ressonância - VORTEX escolhe estes)\n');
    console.log('┌────────┬─────────┐');
    console.log('│ Número │  Score  │');
    console.log('├────────┼─────────┤');

    resonance.slice(0, 10).forEach(r => {
        console.log(`│   ${r.num.toString().padStart(2, ' ')}   │  ${r.score.toString().padStart(5, ' ')}  │`);
    });
    console.log('└────────┴─────────┘');

    console.log('\n🔻 BOTTOM 10 NÚMEROS (Menor Ressonância - ANTI-VORTEX escolhe estes)\n');
    console.log('┌────────┬─────────┐');
    console.log('│ Número │  Score  │');
    console.log('├────────┼─────────┤');

    resonance.slice(-10).forEach(r => {
        console.log(`│   ${r.num.toString().padStart(2, ' ')}   │  ${r.score.toString().padStart(5, ' ')}  │`);
    });
    console.log('└────────┴─────────┘');

    // Analyze distribution
    const scores = resonance.map(r => r.score);
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const maxScore = Math.max(...scores);
    const minScore = Math.min(...scores);

    console.log('\n📊 DISTRIBUIÇÃO DE SCORES\n');
    console.log(`Média: ${avgScore.toFixed(1)}`);
    console.log(`Máximo: ${maxScore}`);
    console.log(`Mínimo: ${minScore}`);
    console.log(`Range: ${maxScore - minScore}`);

    // Check wrap-around
    console.log('\n🔄 VALIDAÇÃO DO WRAP-AROUND\n');

    // Test número 1 (should connect with 50)
    const num1 = resonance.find(r => r.num === 1);
    const num50 = resonance.find(r => r.num === 50);
    const num25 = resonance.find(r => r.num === 25);

    console.log(`Número 1:  Score = ${num1?.score} (conecta com 50 e 2)`);
    console.log(`Número 50: Score = ${num50?.score} (conecta com 49 e 1)`);
    console.log(`Número 25: Score = ${num25?.score} (meio da tabela)`);

    // Show Anti-Vortex prediction
    const vortexTop25 = resonance.slice(0, 25).map(r => r.num);
    const antiVortexTop25 = resonance.slice(-25).map(r => r.num).reverse();

    console.log('\n🎯 PREVISÕES\n');
    console.log('Vortex (top 25):');
    console.log(vortexTop25.sort((a, b) => a - b).join(', '));

    console.log('\nAnti-Vortex (bottom 25):');
    console.log(antiVortexTop25.sort((a, b) => a - b).join(', '));

    // Analyze patterns
    console.log('\n🔍 ANÁLISE DE PADRÕES\n');

    // Check if low scores are compensating
    const lastDraw = draws[0];
    const lastNumbers = typeof lastDraw.numbers === 'string'
        ? JSON.parse(lastDraw.numbers)
        : lastDraw.numbers;

    const antiVortexHits = antiVortexTop25.filter(n => lastNumbers.includes(n)).length;
    const vortexHits = vortexTop25.filter(n => lastNumbers.includes(n)).length;

    console.log(`Último sorteio: ${lastNumbers.join(', ')}`);
    console.log(`\nAcertos Anti-Vortex: ${antiVortexHits}/5`);
    console.log(`Acertos Vortex: ${vortexHits}/5`);

    if (antiVortexHits > vortexHits) {
        console.log('\n✅ Anti-Vortex teve MAIS acertos!');
    } else if (vortexHits > antiVortexHits) {
        console.log('\n⚠️  Vortex teve mais acertos neste sorteio.');
    } else {
        console.log('\n➡️  Empate.');
    }

    console.log('\n' + '═'.repeat(80));
}

analyzeVortex()
    .then(() => {
        console.log('\n✅ Análise concluída!');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n❌ Erro:', error);
        process.exit(1);
    });
