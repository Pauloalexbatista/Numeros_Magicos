import { prisma } from '@/lib/prisma';

/**
 * Test Pareto Principle (80/20 Rule)
 * Theory: 80% of results come from 20% of numbers
 * 
 * In lottery: Do 20% of numbers (10 numbers) account for 80% of appearances?
 */

async function testParetoRule() {
    console.log('📊 TESTE DO PRINCÍPIO DE PARETO (80/20)\n');
    console.log('═'.repeat(80));

    const draws = await prisma.draw.findMany({
        orderBy: { date: 'desc' },
        select: { numbers: true }
    });

    console.log(`Total de sorteios analisados: ${draws.length}\n`);

    // Count frequency of each number
    const frequency: Record<number, number> = {};
    for (let i = 1; i <= 50; i++) {
        frequency[i] = 0;
    }

    let totalAppearances = 0;
    draws.forEach(draw => {
        const numbers = typeof draw.numbers === 'string'
            ? JSON.parse(draw.numbers)
            : draw.numbers;

        (numbers as number[]).forEach(num => {
            frequency[num]++;
            totalAppearances++;
        });
    });

    // Sort by frequency
    const sorted = Object.entries(frequency)
        .map(([num, freq]) => ({ num: parseInt(num), freq }))
        .sort((a, b) => b.freq - a.freq);

    // Test different percentages
    const tests = [
        { name: 'Top 20% (10 números)', count: 10 },
        { name: 'Top 25% (12-13 números)', count: 12 },
        { name: 'Top 30% (15 números)', count: 15 },
        { name: 'Top 40% (20 números)', count: 20 },
        { name: 'Top 50% (25 números)', count: 25 }
    ];

    console.log('🔍 ANÁLISE DE PARETO\n');
    console.log('┌──────────────────────────┬──────────┬────────────┬────────────┐');
    console.log('│ Grupo                    │ Números  │ Aparições  │ % do Total │');
    console.log('├──────────────────────────┼──────────┼────────────┼────────────┤');

    tests.forEach(test => {
        const topNumbers = sorted.slice(0, test.count);
        const topAppearances = topNumbers.reduce((sum, n) => sum + n.freq, 0);
        const percentage = (topAppearances / totalAppearances) * 100;

        const name = test.name.padEnd(24, ' ');
        const count = test.count.toString().padStart(8, ' ');
        const apps = topAppearances.toString().padStart(10, ' ');
        const pct = `${percentage.toFixed(1)}%`.padStart(10, ' ');

        console.log(`│ ${name} │ ${count} │ ${apps} │ ${pct} │`);
    });

    console.log('└──────────────────────────┴──────────┴────────────┴────────────┘');

    // Show top 25 (our system size)
    console.log('\n📈 TOP 25 NÚMEROS MAIS FREQUENTES\n');

    const top25 = sorted.slice(0, 25);
    const top25Appearances = top25.reduce((sum, n) => sum + n.freq, 0);
    const top25Percentage = (top25Appearances / totalAppearances) * 100;

    console.log('Números:', top25.map(n => n.num).join(', '));
    console.log(`\nTotal de aparições: ${top25Appearances}/${totalAppearances}`);
    console.log(`Percentagem: ${top25Percentage.toFixed(1)}%`);

    // Test this as a system
    console.log('\n' + '═'.repeat(80));
    console.log('\n🧪 TESTE COMO SISTEMA (Top 25 vs Bottom 25)\n');

    const bottom25 = sorted.slice(-25).map(n => n.num);

    let top25Hits = 0;
    let bottom25Hits = 0;
    const testSize = 100;

    for (let i = 0; i < Math.min(draws.length, testSize); i++) {
        const draw = draws[i];
        const numbers = typeof draw.numbers === 'string'
            ? JSON.parse(draw.numbers)
            : draw.numbers;

        const hitsTop = (numbers as number[]).filter(n => top25.map(x => x.num).includes(n)).length;
        const hitsBottom = (numbers as number[]).filter(n => bottom25.includes(n)).length;

        top25Hits += hitsTop;
        bottom25Hits += hitsBottom;
    }

    const top25Accuracy = (top25Hits / (testSize * 5)) * 100;
    const bottom25Accuracy = (bottom25Hits / (testSize * 5)) * 100;

    console.log(`Top 25 (mais frequentes):`);
    console.log(`  Acertos: ${top25Hits}/${testSize * 5}`);
    console.log(`  Precisão: ${top25Accuracy.toFixed(1)}%`);

    console.log(`\nBottom 25 (menos frequentes):`);
    console.log(`  Acertos: ${bottom25Hits}/${testSize * 5}`);
    console.log(`  Precisão: ${bottom25Accuracy.toFixed(1)}%`);

    // Compare with current best (55%)
    console.log('\n📊 COMPARAÇÃO COM MELHOR SISTEMA ATUAL (55%)\n');

    if (top25Accuracy > 55) {
        console.log(`✅ Top 25 SUPEROU! (+${(top25Accuracy - 55).toFixed(1)}%)`);
    } else if (top25Accuracy > 50) {
        console.log(`⚠️  Top 25 está perto (${top25Accuracy.toFixed(1)}% vs 55%)`);
    } else {
        console.log(`❌ Top 25 não funciona bem (${top25Accuracy.toFixed(1)}%)`);
    }

    if (bottom25Accuracy > 55) {
        console.log(`✅ Bottom 25 SUPEROU! (+${(bottom25Accuracy - 55).toFixed(1)}%)`);
        console.log(`   💡 Pareto INVERSO funciona!`);
    } else if (bottom25Accuracy > 50) {
        console.log(`⚠️  Bottom 25 está perto (${bottom25Accuracy.toFixed(1)}% vs 55%)`);
    } else {
        console.log(`❌ Bottom 25 não funciona bem (${bottom25Accuracy.toFixed(1)}%)`);
    }

    // Conclusion
    console.log('\n' + '═'.repeat(80));
    console.log('\n💡 CONCLUSÃO\n');

    const paretoHolds = top25Percentage >= 55; // If top 50% has >= 55% of appearances

    if (paretoHolds) {
        console.log('✅ Princípio de Pareto CONFIRMA-SE!');
        console.log(`   Top 50% dos números têm ${top25Percentage.toFixed(1)}% das aparições`);
    } else {
        console.log('❌ Princípio de Pareto NÃO se confirma totalmente');
        console.log(`   Top 50% dos números têm apenas ${top25Percentage.toFixed(1)}% das aparições`);
        console.log('   (Esperado: ~55-60% para confirmar Pareto)');
    }

    console.log('\n🎯 Para o nosso sistema:');
    if (top25Accuracy > bottom25Accuracy) {
        console.log(`   Apostar nos MAIS FREQUENTES (${top25Accuracy.toFixed(1)}%)`);
    } else {
        console.log(`   Apostar nos MENOS FREQUENTES (${bottom25Accuracy.toFixed(1)}%)`);
        console.log(`   💡 Compensação estatística pode estar a funcionar!`);
    }

    console.log('\n' + '═'.repeat(80));
}

testParetoRule()
    .then(() => {
        console.log('\n✅ Teste concluído!');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n❌ Erro:', error);
        process.exit(1);
    });
