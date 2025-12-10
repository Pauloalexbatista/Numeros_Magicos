import { prisma } from '../lib/prisma';

/**
 * TESTE COMPLETO: Todas as Relações entre Raízes
 * 
 * Testa TODAS as combinações de raízes (1-9) para encontrar
 * correlações/oscilações similares à relação 3↔6
 */

function getRoot(num: number): number {
    while (num > 9) {
        num = num.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
    }
    return num;
}

async function findAllCorrelations() {
    console.log('🔬 TESTE COMPLETO: Correlações entre TODAS as Raízes\n');
    console.log('═'.repeat(80));

    const draws = await prisma.draw.findMany({
        orderBy: { date: 'asc' }
    });

    const allDrawNumbers = draws.map(d => {
        const nums = typeof d.numbers === 'string' ? JSON.parse(d.numbers) : d.numbers;
        return nums as number[];
    });

    console.log(`Total de sorteios: ${draws.length}\n`);

    // Testar TODAS as combinações de raízes (1-9)
    const correlations: { pair: string, oscillations: number, total: number, rate: number }[] = [];

    for (let rootA = 1; rootA <= 9; rootA++) {
        for (let rootB = rootA + 1; rootB <= 9; rootB++) {
            let oscillations = 0;
            let total = 0;

            for (let i = 0; i < draws.length - 1; i++) {
                const currentNums = allDrawNumbers[i];
                const nextNums = allDrawNumbers[i + 1];

                const currentHasA = currentNums.some(n => getRoot(n) === rootA);
                const currentHasB = currentNums.some(n => getRoot(n) === rootB);
                const nextHasA = nextNums.some(n => getRoot(n) === rootA);
                const nextHasB = nextNums.some(n => getRoot(n) === rootB);

                if ((currentHasA || currentHasB) && (nextHasA || nextHasB)) {
                    total++;
                    if ((currentHasA && nextHasB) || (currentHasB && nextHasA)) {
                        oscillations++;
                    }
                }
            }

            const rate = total > 0 ? (oscillations / total) * 100 : 0;

            correlations.push({
                pair: `${rootA}↔${rootB}`,
                oscillations,
                total,
                rate
            });
        }
    }

    // Ordenar por taxa de oscilação
    correlations.sort((a, b) => b.rate - a.rate);

    console.log('🏆 TOP 20 CORRELAÇÕES (Taxa de Oscilação):\n');
    console.log('┌──────────┬──────────────┬───────────┬──────────┬────────────┐');
    console.log('│   Rank   │     Par      │ Oscilações│  Total   │    Taxa    │');
    console.log('├──────────┼──────────────┼───────────┼──────────┼────────────┤');

    correlations.slice(0, 20).forEach((c, idx) => {
        const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '  ';
        const rankStr = `${medal} ${(idx + 1).toString().padStart(2)}`;
        const pairStr = c.pair.padEnd(12);
        const oscStr = c.oscillations.toString().padStart(9);
        const totalStr = c.total.toString().padStart(8);
        const rateStr = `${c.rate.toFixed(2)}%`.padStart(10);

        console.log(`│ ${rankStr} │ ${pairStr} │ ${oscStr} │ ${totalStr} │ ${rateStr} │`);
    });

    console.log('└──────────┴──────────────┴───────────┴──────────┴────────────┘');

    // Análise
    console.log('\n' + '═'.repeat(80));
    console.log('\n📊 ANÁLISE:\n');

    const top5 = correlations.slice(0, 5);

    console.log('Top 5 Correlações Mais Fortes:\n');
    top5.forEach((c, idx) => {
        const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx === 3 ? '4️⃣' : '5️⃣';
        console.log(`${medal} ${c.pair}: ${c.rate.toFixed(2)}% (${c.oscillations}/${c.total})`);

        if (c.rate > 70) {
            console.log(`   ✅ FORTE! Muito acima de 50%`);
        } else if (c.rate > 60) {
            console.log(`   ✅ BOM! Acima de 60%`);
        } else if (c.rate > 52) {
            console.log(`   ⚠️  FRACO. Ligeiramente acima de 50%`);
        } else {
            console.log(`   ➖ Normal (próximo de 50%)`);
        }
        console.log('');
    });

    // Comparar com 3↔6
    const relation36 = correlations.find(c => c.pair === '3↔6');

    console.log('═'.repeat(80));
    console.log('\n🎯 COMPARAÇÃO COM 3↔6:\n');

    if (relation36) {
        console.log(`Relação 3↔6: ${relation36.rate.toFixed(2)}% (${relation36.oscillations}/${relation36.total})`);
        console.log(`Posição no ranking: #${correlations.indexOf(relation36) + 1} de ${correlations.length}\n`);

        const betterThan36 = correlations.filter(c => c.rate > relation36.rate);

        if (betterThan36.length === 0) {
            console.log('✅ 3↔6 é a MELHOR correlação!');
        } else {
            console.log(`⚠️  Existem ${betterThan36.length} correlações MELHORES que 3↔6:`);
            betterThan36.forEach(c => {
                console.log(`   ${c.pair}: ${c.rate.toFixed(2)}%`);
            });
        }
    }

    // Grupos especiais
    console.log('\n' + '═'.repeat(80));
    console.log('\n🔍 GRUPOS ESPECIAIS:\n');

    // Circuito físico vs espiritual
    const physical = [1, 2, 4, 5, 7, 8];
    const spiritual = [3, 6, 9];

    console.log('Correlações DENTRO do Circuito Físico (1,2,4,5,7,8):');
    const physicalCorr = correlations.filter(c => {
        const [a, b] = c.pair.split('↔').map(n => parseInt(n));
        return physical.includes(a) && physical.includes(b);
    }).slice(0, 5);

    physicalCorr.forEach(c => {
        console.log(`  ${c.pair}: ${c.rate.toFixed(2)}%`);
    });

    console.log('\nCorrelações DENTRO do Circuito Espiritual (3,6,9):');
    const spiritualCorr = correlations.filter(c => {
        const [a, b] = c.pair.split('↔').map(n => parseInt(n));
        return spiritual.includes(a) && spiritual.includes(b);
    });

    spiritualCorr.forEach(c => {
        console.log(`  ${c.pair}: ${c.rate.toFixed(2)}%`);
    });

    console.log('\nCorrelações ENTRE circuitos (Físico ↔ Espiritual):');
    const crossCorr = correlations.filter(c => {
        const [a, b] = c.pair.split('↔').map(n => parseInt(n));
        return (physical.includes(a) && spiritual.includes(b)) ||
            (spiritual.includes(a) && physical.includes(b));
    }).slice(0, 5);

    crossCorr.forEach(c => {
        console.log(`  ${c.pair}: ${c.rate.toFixed(2)}%`);
    });

    console.log('\n' + '═'.repeat(80));

    await prisma.$disconnect();
}

findAllCorrelations()
    .then(() => {
        console.log('\n✅ Análise concluída!');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n❌ Erro:', error);
        process.exit(1);
    });
