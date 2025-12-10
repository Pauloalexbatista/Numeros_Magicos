import { prisma } from '../lib/prisma';

/**
 * ANÁLISE: Raiz da SOMA TOTAL de cada sorteio
 * 
 * Testa se há padrão na raiz da soma de todos os números
 */

function getRoot(num: number): number {
    while (num > 9) {
        num = num.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
    }
    return num;
}

async function analyzeDrawSumRoots() {
    console.log('🔬 ANÁLISE: Raiz da Soma Total dos Sorteios\n');
    console.log('═'.repeat(80));

    const draws = await prisma.draw.findMany({
        orderBy: { date: 'asc' }
    });

    console.log(`Total de sorteios: ${draws.length}\n`);

    // Calcular raiz da soma para cada sorteio
    const sumRoots: number[] = [];
    const examples: any[] = [];

    draws.forEach((draw, idx) => {
        const nums = typeof draw.numbers === 'string'
            ? JSON.parse(draw.numbers)
            : draw.numbers as number[];

        const sum = nums.reduce((total: number, n: number) => total + n, 0);
        const root = getRoot(sum);
        sumRoots.push(root);

        // Guardar primeiros 20 exemplos
        if (idx < 20) {
            examples.push({
                id: draw.id,
                date: new Date(draw.date).toLocaleDateString('pt-PT'),
                nums,
                sum,
                root
            });
        }
    });

    // Mostrar exemplos
    console.log('📋 EXEMPLOS (Primeiros 20 Sorteios):\n');
    console.log('┌──────┬────────────┬───────────────────────┬───────┬──────┐');
    console.log('│  #   │    Data    │       Números         │  Soma │ Raiz │');
    console.log('├──────┼────────────┼───────────────────────┼───────┼──────┤');

    examples.forEach(ex => {
        const numStr = ex.nums.join(',').padEnd(21);
        const dateStr = ex.date.padEnd(10);
        console.log(`│ ${ex.id.toString().padStart(4)} │ ${dateStr} │ ${numStr} │ ${ex.sum.toString().padStart(5)} │   ${ex.root}  │`);
    });

    console.log('└──────┴────────────┴───────────────────────┴───────┴──────┘');

    // Estatísticas de distribuição
    console.log('\n' + '═'.repeat(80));
    console.log('\n📊 DISTRIBUIÇÃO DE RAÍZES DA SOMA:\n');

    const distribution: Record<number, number> = {};
    for (let i = 1; i <= 9; i++) distribution[i] = 0;

    sumRoots.forEach(root => distribution[root]++);

    const sorted = Object.entries(distribution)
        .sort(([, a], [, b]) => b - a);

    sorted.forEach(([root, count], idx) => {
        const percentage = (count / draws.length) * 100;
        const bar = '█'.repeat(Math.floor(percentage / 2));
        const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '  ';
        console.log(`${medal} Raiz ${root}: ${count.toString().padStart(4)} sorteios (${percentage.toFixed(1)}%) ${bar}`);
    });

    // Testar oscilação
    console.log('\n' + '═'.repeat(80));
    console.log('\n🔄 TESTE DE OSCILAÇÃO (Raiz da Soma):\n');

    // Testar todas as combinações
    const oscillations: { pair: string, count: number, total: number, rate: number }[] = [];

    for (let rootA = 1; rootA <= 9; rootA++) {
        for (let rootB = rootA + 1; rootB <= 9; rootB++) {
            let oscCount = 0;
            let totalCount = 0;

            for (let i = 0; i < sumRoots.length - 1; i++) {
                const current = sumRoots[i];
                const next = sumRoots[i + 1];

                if ((current === rootA || current === rootB) && (next === rootA || next === rootB)) {
                    totalCount++;
                    if (current !== next) {
                        oscCount++;
                    }
                }
            }

            if (totalCount > 0) {
                const rate = (oscCount / totalCount) * 100;
                oscillations.push({
                    pair: `${rootA}↔${rootB}`,
                    count: oscCount,
                    total: totalCount,
                    rate
                });
            }
        }
    }

    // Ordenar por taxa
    oscillations.sort((a, b) => b.rate - a.rate);

    console.log('Top 10 Pares com Maior Oscilação:\n');
    console.log('┌──────┬──────────┬──────────────┬───────────┬──────────┐');
    console.log('│ Rank │   Par    │  Oscilações  │   Total   │   Taxa   │');
    console.log('├──────┼──────────┼──────────────┼───────────┼──────────┤');

    oscillations.slice(0, 10).forEach((osc, idx) => {
        const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '  ';
        const rankStr = `${medal} ${(idx + 1).toString().padStart(2)}`;
        console.log(`│ ${rankStr} │ ${osc.pair.padEnd(8)} │ ${osc.count.toString().padStart(12)} │ ${osc.total.toString().padStart(9)} │ ${osc.rate.toFixed(2).padStart(7)}% │`);
    });

    console.log('└──────┴──────────┴──────────────┴───────────┴──────────┘');

    // Sequência dos últimos 50
    console.log('\n' + '═'.repeat(80));
    console.log('\n📈 SEQUÊNCIA (Últimos 50 Sorteios):\n');

    const last50 = sumRoots.slice(-50);
    console.log('Raízes da soma:');

    for (let i = 0; i < last50.length; i += 10) {
        const chunk = last50.slice(i, i + 10);
        console.log(`  ${chunk.join(' → ')}`);
    }

    // Padrões de repetição
    console.log('\n' + '═'.repeat(80));
    console.log('\n🔍 PADRÕES DE TRANSIÇÃO:\n');

    const transitions: Record<string, number> = {};

    for (let i = 0; i < sumRoots.length - 1; i++) {
        const key = `${sumRoots[i]}→${sumRoots[i + 1]}`;
        transitions[key] = (transitions[key] || 0) + 1;
    }

    const sortedTrans = Object.entries(transitions)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 15);

    console.log('Top 15 Transições Mais Comuns:\n');
    sortedTrans.forEach(([trans, count], idx) => {
        const percentage = (count / (draws.length - 1)) * 100;
        console.log(`  ${(idx + 1).toString().padStart(2)}. ${trans}: ${count.toString().padStart(3)} vezes (${percentage.toFixed(1)}%)`);
    });

    // Análise de ciclos
    console.log('\n' + '═'.repeat(80));
    console.log('\n🔄 ANÁLISE DE CICLOS:\n');

    // Verificar se raiz tende a repetir ou alternar
    let repeats = 0;
    let alternates = 0;

    for (let i = 0; i < sumRoots.length - 1; i++) {
        if (sumRoots[i] === sumRoots[i + 1]) {
            repeats++;
        } else {
            alternates++;
        }
    }

    const repeatRate = (repeats / (draws.length - 1)) * 100;
    const alternateRate = (alternates / (draws.length - 1)) * 100;

    console.log(`Repetições (mesma raiz): ${repeats} (${repeatRate.toFixed(1)}%)`);
    console.log(`Alternâncias (raiz diferente): ${alternates} (${alternateRate.toFixed(1)}%)`);

    if (alternateRate > 60) {
        console.log('\n✅ Sistema tende a ALTERNAR raízes!');
    } else if (repeatRate > 60) {
        console.log('\n⚠️  Sistema tende a REPETIR raízes!');
    } else {
        console.log('\n➖ Sistema é EQUILIBRADO (sem tendência clara)');
    }

    console.log('\n' + '═'.repeat(80));

    await prisma.$disconnect();
}

analyzeDrawSumRoots()
    .then(() => {
        console.log('\n✅ Análise concluída!');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n❌ Erro:', error);
        process.exit(1);
    });
