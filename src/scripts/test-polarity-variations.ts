import { prisma } from '../lib/prisma';

/**
 * TESTE DE VARIAÇÕES: Polaridade Tesla-Rodin
 * 
 * Testa 4 abordagens diferentes:
 * 1. Original: Raiz 3 vs Raiz 6 (individual)
 * 2. Soma Total: Raiz da soma de todos os números
 * 3. Circuito Dividido: (1,2,4)→3 vs (5,7,8)→6
 * 4. Par/Ímpar: (2,4,8)→6 vs (1,5,7)→3
 */

function getRoot(num: number): number {
    while (num > 9) {
        num = num.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
    }
    return num;
}

async function testPolarityVariations() {
    console.log('🧪 TESTE DE VARIAÇÕES: Polaridade Tesla-Rodin\n');
    console.log('═'.repeat(80));

    const draws = await prisma.draw.findMany({
        orderBy: { date: 'asc' }
    });

    const allDrawNumbers = draws.map(d => {
        const nums = typeof d.numbers === 'string' ? (typeof d.numbers === "string" ? JSON.parse(d.numbers) : d.numbers) : d.numbers;
        return nums as number[];
    });

    console.log(`Total de sorteios: ${draws.length}\n`);

    // ========================================
    // VARIAÇÃO 1: Original (Raiz 3 vs 6)
    // ========================================
    console.log('📊 VARIAÇÃO 1: Raiz 3 vs Raiz 6 (Original)\n');

    let osc1 = 0;
    let total1 = 0;

    for (let i = 0; i < draws.length - 1; i++) {
        const currentNums = allDrawNumbers[i];
        const nextNums = allDrawNumbers[i + 1];

        const currentHas3 = currentNums.some(n => getRoot(n) === 3);
        const currentHas6 = currentNums.some(n => getRoot(n) === 6);
        const nextHas3 = nextNums.some(n => getRoot(n) === 3);
        const nextHas6 = nextNums.some(n => getRoot(n) === 6);

        if ((currentHas3 || currentHas6) && (nextHas3 || nextHas6)) {
            total1++;
            if ((currentHas3 && nextHas6) || (currentHas6 && nextHas3)) {
                osc1++;
            }
        }
    }

    const rate1 = (osc1 / total1) * 100;
    console.log(`  Oscilações: ${osc1}/${total1} (${rate1.toFixed(2)}%)`);

    // ========================================
    // VARIAÇÃO 2: Soma Total do Sorteio
    // ========================================
    console.log('\n📊 VARIAÇÃO 2: Raiz da SOMA TOTAL do sorteio\n');

    let osc2 = 0;
    let total2 = 0;

    for (let i = 0; i < draws.length - 1; i++) {
        const currentNums = allDrawNumbers[i];
        const nextNums = allDrawNumbers[i + 1];

        // Soma total de cada sorteio
        const currentSum = currentNums.reduce((sum, n) => sum + n, 0);
        const nextSum = nextNums.reduce((sum, n) => sum + n, 0);

        const currentRoot = getRoot(currentSum);
        const nextRoot = getRoot(nextSum);

        // Só conta se ambos têm raiz 3 ou 6
        if ([3, 6].includes(currentRoot) && [3, 6].includes(nextRoot)) {
            total2++;
            if (currentRoot !== nextRoot) {
                osc2++;
            }
        }
    }

    const rate2 = total2 > 0 ? (osc2 / total2) * 100 : 0;
    console.log(`  Oscilações: ${osc2}/${total2} (${rate2.toFixed(2)}%)`);

    // ========================================
    // VARIAÇÃO 3: Circuito Dividido
    // ========================================
    console.log('\n📊 VARIAÇÃO 3: Circuito Dividido (1,2,4)→3 vs (5,7,8)→6\n');

    let osc3 = 0;
    let total3 = 0;

    for (let i = 0; i < draws.length - 1; i++) {
        const currentNums = allDrawNumbers[i];
        const nextNums = allDrawNumbers[i + 1];

        // Contar raízes por grupo
        const currentGroup3 = currentNums.filter(n => [1, 2, 4].includes(getRoot(n))).length;
        const currentGroup6 = currentNums.filter(n => [5, 7, 8].includes(getRoot(n))).length;

        const nextGroup3 = nextNums.filter(n => [1, 2, 4].includes(getRoot(n))).length;
        const nextGroup6 = nextNums.filter(n => [5, 7, 8].includes(getRoot(n))).length;

        // Determinar polaridade dominante
        const currentDominant = currentGroup3 > currentGroup6 ? 3 : currentGroup6 > currentGroup3 ? 6 : 0;
        const nextDominant = nextGroup3 > nextGroup6 ? 3 : nextGroup6 > nextGroup3 ? 6 : 0;

        if (currentDominant !== 0 && nextDominant !== 0) {
            total3++;
            if (currentDominant !== nextDominant) {
                osc3++;
            }
        }
    }

    const rate3 = total3 > 0 ? (osc3 / total3) * 100 : 0;
    console.log(`  Oscilações: ${osc3}/${total3} (${rate3.toFixed(2)}%)`);

    // ========================================
    // VARIAÇÃO 4: Par vs Ímpar
    // ========================================
    console.log('\n📊 VARIAÇÃO 4: Par/Ímpar (2,4,8)→6 vs (1,5,7)→3\n');

    let osc4 = 0;
    let total4 = 0;

    for (let i = 0; i < draws.length - 1; i++) {
        const currentNums = allDrawNumbers[i];
        const nextNums = allDrawNumbers[i + 1];

        // Contar raízes por paridade
        const currentPares = currentNums.filter(n => [2, 4, 8].includes(getRoot(n))).length;
        const currentImpares = currentNums.filter(n => [1, 5, 7].includes(getRoot(n))).length;

        const nextPares = nextNums.filter(n => [2, 4, 8].includes(getRoot(n))).length;
        const nextImpares = nextNums.filter(n => [1, 5, 7].includes(getRoot(n))).length;

        // Determinar polaridade dominante
        const currentDominant = currentPares > currentImpares ? 6 : currentImpares > currentPares ? 3 : 0;
        const nextDominant = nextPares > nextImpares ? 6 : nextImpares > nextPares ? 3 : 0;

        if (currentDominant !== 0 && nextDominant !== 0) {
            total4++;
            if (currentDominant !== nextDominant) {
                osc4++;
            }
        }
    }

    const rate4 = total4 > 0 ? (osc4 / total4) * 100 : 0;
    console.log(`  Oscilações: ${osc4}/${total4} (${rate4.toFixed(2)}%)`);

    // ========================================
    // COMPARAÇÃO FINAL
    // ========================================
    console.log('\n' + '═'.repeat(80));
    console.log('\n🏆 RANKING DAS VARIAÇÕES:\n');

    const variations = [
        { name: 'Raiz 3 vs 6 (Original)', rate: rate1, osc: osc1, total: total1 },
        { name: 'Soma Total', rate: rate2, osc: osc2, total: total2 },
        { name: 'Circuito Dividido', rate: rate3, osc: osc3, total: total3 },
        { name: 'Par vs Ímpar', rate: rate4, osc: osc4, total: total4 }
    ];

    variations.sort((a, b) => b.rate - a.rate);

    variations.forEach((v, idx) => {
        const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '  ';
        console.log(`${medal} ${(idx + 1)}. ${v.name}`);
        console.log(`     Taxa: ${v.rate.toFixed(2)}% (${v.osc}/${v.total} oscilações)`);
        console.log(`     vs Aleatório (50%): ${v.rate > 50 ? '+' : ''}${(v.rate - 50).toFixed(2)}%\n`);
    });

    // Análise estatística
    console.log('═'.repeat(80));
    console.log('\n💡 ANÁLISE:\n');

    const best = variations[0];

    if (best.rate > 70) {
        console.log(`✅ EXCELENTE! "${best.name}" tem ${best.rate.toFixed(2)}% de oscilação!`);
        console.log(`   Muito acima do aleatório (50%)`);
        console.log(`   Recomendação: IMPLEMENTAR este método!`);
    } else if (best.rate > 60) {
        console.log(`✅ BOM! "${best.name}" tem ${best.rate.toFixed(2)}% de oscilação`);
        console.log(`   Acima do aleatório mas não extremo`);
        console.log(`   Recomendação: Testar em sistema`);
    } else if (best.rate > 52) {
        console.log(`⚠️  FRACO. "${best.name}" tem ${best.rate.toFixed(2)}% de oscilação`);
        console.log(`   Ligeiramente acima do aleatório`);
        console.log(`   Recomendação: Não vale a pena`);
    } else {
        console.log(`❌ NENHUMA variação mostra padrão forte`);
        console.log(`   Todas próximas de 50% (aleatório)`);
    }

    console.log('\n' + '═'.repeat(80));

    await prisma.$disconnect();
}

testPolarityVariations()
    .then(() => {
        console.log('\n✅ Teste concluído!');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n❌ Erro:', error);
        process.exit(1);
    });
