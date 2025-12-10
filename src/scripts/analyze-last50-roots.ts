import { prisma } from '../lib/prisma';

/**
 * ANÁLISE: Raízes Dominantes nos Últimos 50 Sorteios
 * 
 * Verifica qual raiz (1-9) aparece MAIS nos últimos 50 sorteios
 * e procura padrões de alternância
 */

function getRoot(num: number): number {
    while (num > 9) {
        num = num.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
    }
    return num;
}

async function analyzeLast50() {
    console.log('📊 ANÁLISE: Raízes Dominantes (Últimos 50 Sorteios)\n');
    console.log('═'.repeat(100));

    // Buscar últimos 50 sorteios
    const draws = await prisma.draw.findMany({
        orderBy: { date: 'desc' },
        take: 50
    });

    draws.reverse(); // Ordem cronológica

    console.log(`\nTotal de sorteios analisados: ${draws.length}\n`);

    // Tabela de frequências por sorteio
    console.log('┌──────┬────────────┬───────────────────────┬─────────────────────────────────────────────────┬──────────────┐');
    console.log('│  #   │    Data    │       Números         │         Frequência por Raiz (1-9)               │  Dominante   │');
    console.log('├──────┼────────────┼───────────────────────┼─────────────────────────────────────────────────┼──────────────┤');

    const dominantSequence: number[] = [];
    const rootFrequencies: Record<number, number> = {};
    for (let i = 1; i <= 9; i++) rootFrequencies[i] = 0;

    draws.forEach(draw => {
        const nums = typeof draw.numbers === 'string'
            ? JSON.parse(draw.numbers)
            : draw.numbers as number[];

        // Contar raízes neste sorteio
        const counts: Record<number, number> = {};
        for (let i = 1; i <= 9; i++) counts[i] = 0;

        nums.forEach(n => {
            const root = getRoot(n);
            counts[root]++;
            rootFrequencies[root]++;
        });

        // Encontrar dominante
        let maxCount = 0;
        let dominant = 0;
        for (let i = 1; i <= 9; i++) {
            if (counts[i] > maxCount) {
                maxCount = counts[i];
                dominant = i;
            }
        }

        dominantSequence.push(dominant);

        // Formatar linha
        const numStr = nums.join(',').padEnd(21);
        const dateStr = new Date(draw.date).toLocaleDateString('pt-PT').padEnd(10);
        const freqStr = `${counts[1]},${counts[2]},${counts[3]},${counts[4]},${counts[5]},${counts[6]},${counts[7]},${counts[8]},${counts[9]}`.padEnd(47);
        const domStr = `Raiz ${dominant}`.padEnd(12);

        console.log(`│ ${draw.id.toString().padStart(4)} │ ${dateStr} │ ${numStr} │ ${freqStr} │ ${domStr} │`);
    });

    console.log('└──────┴────────────┴───────────────────────┴─────────────────────────────────────────────────┴──────────────┘');

    // Estatísticas gerais
    console.log('\n' + '═'.repeat(100));
    console.log('\n📊 FREQUÊNCIA TOTAL POR RAIZ (50 sorteios):\n');

    const totalNumbers = draws.length * 5;
    const sorted = Object.entries(rootFrequencies)
        .sort(([, a], [, b]) => b - a);

    sorted.forEach(([root, count], idx) => {
        const percentage = (count / totalNumbers) * 100;
        const bar = '█'.repeat(Math.floor(percentage / 2));
        const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '  ';

        console.log(`${medal} Raiz ${root}: ${count.toString().padStart(3)} vezes (${percentage.toFixed(1)}%) ${bar}`);
    });

    // Análise de dominância
    console.log('\n' + '═'.repeat(100));
    console.log('\n🏆 RAÍZES DOMINANTES POR SORTEIO:\n');

    const dominantCounts: Record<number, number> = {};
    for (let i = 1; i <= 9; i++) dominantCounts[i] = 0;

    dominantSequence.forEach(d => {
        if (d > 0) dominantCounts[d]++;
    });

    const sortedDominant = Object.entries(dominantCounts)
        .sort(([, a], [, b]) => b - a);

    sortedDominant.forEach(([root, count], idx) => {
        const percentage = (count / draws.length) * 100;
        const bar = '█'.repeat(Math.floor(percentage / 3));
        const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '  ';

        console.log(`${medal} Raiz ${root}: ${count.toString().padStart(2)} sorteios (${percentage.toFixed(1)}%) ${bar}`);
    });

    // Análise de padrões
    console.log('\n' + '═'.repeat(100));
    console.log('\n🔍 PADRÕES DE ALTERNÂNCIA:\n');

    // Sequência de dominantes
    console.log('Sequência de raízes dominantes (últimos 20):');
    const last20 = dominantSequence.slice(-20);
    console.log(`  ${last20.join(' → ')}\n`);

    // Verificar se há ciclos
    console.log('Transições mais comuns:');
    const transitions: Record<string, number> = {};

    for (let i = 0; i < dominantSequence.length - 1; i++) {
        const key = `${dominantSequence[i]}→${dominantSequence[i + 1]}`;
        transitions[key] = (transitions[key] || 0) + 1;
    }

    const sortedTrans = Object.entries(transitions)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10);

    sortedTrans.forEach(([trans, count]) => {
        console.log(`  ${trans}: ${count} vezes`);
    });

    // Foco em 3, 6, 9
    console.log('\n' + '═'.repeat(100));
    console.log('\n⚡ FOCO EM 3, 6, 9:\n');

    const count369 = rootFrequencies[3] + rootFrequencies[6] + rootFrequencies[9];
    const percentage369 = (count369 / totalNumbers) * 100;

    console.log(`Total de números com raiz 3, 6 ou 9: ${count369} (${percentage369.toFixed(1)}%)`);
    console.log(`  Raiz 3: ${rootFrequencies[3]} (${(rootFrequencies[3] / totalNumbers * 100).toFixed(1)}%)`);
    console.log(`  Raiz 6: ${rootFrequencies[6]} (${(rootFrequencies[6] / totalNumbers * 100).toFixed(1)}%)`);
    console.log(`  Raiz 9: ${rootFrequencies[9]} (${(rootFrequencies[9] / totalNumbers * 100).toFixed(1)}%)`);

    const dominant369Count = dominantCounts[3] + dominantCounts[6] + dominantCounts[9];
    console.log(`\nSorteios dominados por 3, 6 ou 9: ${dominant369Count} de ${draws.length} (${(dominant369Count / draws.length * 100).toFixed(1)}%)`);

    // Recomendação
    console.log('\n' + '═'.repeat(100));
    console.log('\n💡 CONCLUSÃO:\n');

    const topRoot = sorted[0][0];
    const topCount = sorted[0][1];
    const topPercentage = (topCount / totalNumbers) * 100;

    console.log(`🥇 Raiz MAIS FORTE nos últimos 50: Raiz ${topRoot}`);
    console.log(`   Apareceu ${topCount} vezes (${topPercentage.toFixed(1)}%)`);
    console.log(`   Números com raiz ${topRoot}:`);

    const numsWithTopRoot: number[] = [];
    for (let i = 1; i <= 50; i++) {
        if (getRoot(i) === parseInt(topRoot)) {
            numsWithTopRoot.push(i);
        }
    }
    console.log(`   ${numsWithTopRoot.join(', ')}`);

    console.log('\n' + '═'.repeat(100));

    await prisma.$disconnect();
}

analyzeLast50()
    .then(() => {
        console.log('\n✅ Análise concluída!');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n❌ Erro:', error);
        process.exit(1);
    });
