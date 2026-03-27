import { prisma } from '../lib/prisma';

/**
 * ANÁLISE TESLA-RODIN: Matemática Vortex aplicada à Lotaria
 * 
 * Testa as teorias de Nikola Tesla e Marko Rodin:
 * - Circuito Físico: 1, 2, 4, 5, 7, 8 (loop infinito)
 * - Circuito Espiritual: 3, 6, 9 (polaridade e eixo)
 * 
 * Questões:
 * 1. Números com raiz 3, 6, 9 aparecem mais/menos que o esperado?
 * 2. Existe oscilação 3↔6 em sorteios consecutivos?
 * 3. O 9 funciona como "reset"?
 * 4. A sequência 1→2→4→8→7→5 aparece nos sorteios?
 */

// Redução teosófica (digital root)
function getRoot(num: number): number {
    while (num > 9) {
        num = num.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
    }
    return num;
}

// Classificar número por circuito
function getCircuit(num: number): 'physical' | 'spiritual' {
    const root = getRoot(num);
    return [3, 6, 9].includes(root) ? 'spiritual' : 'physical';
}

async function analyzeRodinPatterns() {
    console.log('🔬 ANÁLISE TESLA-RODIN: Matemática Vortex\n');
    console.log('═'.repeat(80));

    const draws = await prisma.draw.findMany({
        orderBy: { date: 'asc' }
    });

    console.log(`Total de sorteios: ${draws.length}\n`);

    // Parse numbers
    const allDrawNumbers = draws.map(d => {
        const nums = typeof d.numbers === 'string' ? (typeof d.numbers === "string" ? JSON.parse(d.numbers) : d.numbers) : d.numbers;
        return nums as number[];
    });

    // ========================================
    // TESTE 1: Frequência de Raízes (1-9)
    // ========================================
    console.log('📊 TESTE 1: Frequência de Raízes Digitais\n');

    const rootFrequency: Record<number, number> = {};
    for (let i = 1; i <= 9; i++) rootFrequency[i] = 0;

    // Contar quantos números de 1-50 têm cada raiz
    const rootDistribution: Record<number, number[]> = {};
    for (let i = 1; i <= 9; i++) rootDistribution[i] = [];

    for (let num = 1; num <= 50; num++) {
        const root = getRoot(num);
        rootDistribution[root].push(num);
    }

    console.log('Distribuição de números (1-50) por raiz:');
    for (let i = 1; i <= 9; i++) {
        console.log(`  Raiz ${i}: ${rootDistribution[i].length} números (${(rootDistribution[i].length / 50 * 100).toFixed(1)}%)`);
    }

    // Contar frequência real nos sorteios
    allDrawNumbers.forEach(nums => {
        nums.forEach(n => {
            const root = getRoot(n);
            rootFrequency[root]++;
        });
    });

    const totalNumbers = draws.length * 5;

    console.log('\nFrequência REAL nos sorteios:');
    for (let i = 1; i <= 9; i++) {
        const expected = (rootDistribution[i].length / 50) * 100;
        const actual = (rootFrequency[i] / totalNumbers) * 100;
        const diff = actual - expected;
        const symbol = diff > 0.5 ? '📈' : diff < -0.5 ? '📉' : '➖';

        console.log(`  Raiz ${i}: ${rootFrequency[i]} vezes (${actual.toFixed(2)}%) ${symbol} Esperado: ${expected.toFixed(2)}% (${diff > 0 ? '+' : ''}${diff.toFixed(2)}%)`);
    }

    // Análise Circuitos
    console.log('\n🔄 CIRCUITOS TESLA-RODIN:\n');

    const physicalRoots = [1, 2, 4, 5, 7, 8];
    const spiritualRoots = [3, 6, 9];

    const physicalCount = physicalRoots.reduce((sum, r) => sum + rootFrequency[r], 0);
    const spiritualCount = spiritualRoots.reduce((sum, r) => sum + rootFrequency[r], 0);

    const physicalExpected = physicalRoots.reduce((sum, r) => sum + rootDistribution[r].length, 0) / 50 * 100;
    const spiritualExpected = spiritualRoots.reduce((sum, r) => sum + rootDistribution[r].length, 0) / 50 * 100;

    const physicalActual = (physicalCount / totalNumbers) * 100;
    const spiritualActual = (spiritualCount / totalNumbers) * 100;

    console.log(`Circuito FÍSICO (1,2,4,5,7,8):`);
    console.log(`  Esperado: ${physicalExpected.toFixed(2)}%`);
    console.log(`  Real: ${physicalActual.toFixed(2)}%`);
    console.log(`  Diferença: ${(physicalActual - physicalExpected > 0 ? '+' : '')}${(physicalActual - physicalExpected).toFixed(2)}%`);

    console.log(`\nCircuito ESPIRITUAL (3,6,9):`);
    console.log(`  Esperado: ${spiritualExpected.toFixed(2)}%`);
    console.log(`  Real: ${spiritualActual.toFixed(2)}%`);
    console.log(`  Diferença: ${(spiritualActual - spiritualExpected > 0 ? '+' : '')}${(spiritualActual - spiritualExpected).toFixed(2)}%`);

    // ========================================
    // TESTE 2: Oscilação 3↔6
    // ========================================
    console.log('\n' + '═'.repeat(80));
    console.log('\n⚡ TESTE 2: Oscilação 3↔6 (Polaridade)\n');

    let oscillations36 = 0;
    let total36Transitions = 0;

    for (let i = 0; i < draws.length - 1; i++) {
        const currentNums = allDrawNumbers[i];
        const nextNums = allDrawNumbers[i + 1];

        const currentHas3 = currentNums.some(n => getRoot(n) === 3);
        const currentHas6 = currentNums.some(n => getRoot(n) === 6);
        const nextHas3 = nextNums.some(n => getRoot(n) === 3);
        const nextHas6 = nextNums.some(n => getRoot(n) === 6);

        if ((currentHas3 || currentHas6) && (nextHas3 || nextHas6)) {
            total36Transitions++;
            if ((currentHas3 && nextHas6) || (currentHas6 && nextHas3)) {
                oscillations36++;
            }
        }
    }

    const oscillationRate = (oscillations36 / total36Transitions) * 100;
    console.log(`Transições com 3 ou 6: ${total36Transitions}`);
    console.log(`Oscilações 3↔6: ${oscillations36} (${oscillationRate.toFixed(2)}%)`);
    console.log(`Esperado (aleatório): ~50%`);
    console.log(`Resultado: ${oscillationRate > 52 ? '📈 Acima' : oscillationRate < 48 ? '📉 Abaixo' : '➖ Normal'}`);

    // ========================================
    // TESTE 3: O 9 como "Reset"
    // ========================================
    console.log('\n' + '═'.repeat(80));
    console.log('\n🎯 TESTE 3: O 9 como "Reset" ou Eixo\n');

    const rootsAfter9: Record<number, number> = {};
    for (let i = 1; i <= 9; i++) rootsAfter9[i] = 0;

    for (let i = 0; i < draws.length - 1; i++) {
        const currentNums = allDrawNumbers[i];
        const nextNums = allDrawNumbers[i + 1];

        const has9 = currentNums.some(n => getRoot(n) === 9);

        if (has9) {
            nextNums.forEach(n => {
                const root = getRoot(n);
                rootsAfter9[root]++;
            });
        }
    }

    const totalAfter9 = Object.values(rootsAfter9).reduce((sum, v) => sum + v, 0);

    console.log('Distribuição de raízes APÓS sorteios com 9:');
    for (let i = 1; i <= 9; i++) {
        const percentage = (rootsAfter9[i] / totalAfter9) * 100;
        const expected = (rootDistribution[i].length / 50) * 100;
        const diff = percentage - expected;

        console.log(`  Raiz ${i}: ${rootsAfter9[i]} (${percentage.toFixed(2)}%) - Esperado: ${expected.toFixed(2)}% (${diff > 0 ? '+' : ''}${diff.toFixed(2)}%)`);
    }

    // ========================================
    // TESTE 4: Sequência do Circuito Físico
    // ========================================
    console.log('\n' + '═'.repeat(80));
    console.log('\n🔄 TESTE 4: Sequência do Circuito Físico (1→2→4→8→7→5→1)\n');

    const sequence = [1, 2, 4, 8, 7, 5];
    const sequenceTransitions: Record<string, number> = {};
    let totalPhysicalTransitions = 0;

    for (let i = 0; i < draws.length - 1; i++) {
        const currentNums = allDrawNumbers[i];
        const nextNums = allDrawNumbers[i + 1];

        // Get dominant root (most frequent) in each draw
        const currentRoots = currentNums.map(n => getRoot(n));
        const nextRoots = nextNums.map(n => getRoot(n));

        currentRoots.forEach(cr => {
            if (sequence.includes(cr)) {
                nextRoots.forEach(nr => {
                    if (sequence.includes(nr)) {
                        const key = `${cr}→${nr}`;
                        sequenceTransitions[key] = (sequenceTransitions[key] || 0) + 1;
                        totalPhysicalTransitions++;
                    }
                });
            }
        });
    }

    console.log('Transições mais frequentes no circuito físico:');
    const sortedTransitions = Object.entries(sequenceTransitions)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10);

    sortedTransitions.forEach(([transition, count]) => {
        const percentage = (count / totalPhysicalTransitions) * 100;
        console.log(`  ${transition}: ${count} vezes (${percentage.toFixed(2)}%)`);
    });

    // Check if sequence pattern exists
    const expectedSequenceTransitions = [
        '1→2', '2→4', '4→8', '8→7', '7→5', '5→1'
    ];

    console.log('\nTransições esperadas da sequência de Rodin:');
    expectedSequenceTransitions.forEach(trans => {
        const count = sequenceTransitions[trans] || 0;
        const percentage = (count / totalPhysicalTransitions) * 100;
        console.log(`  ${trans}: ${count} vezes (${percentage.toFixed(2)}%)`);
    });

    // ========================================
    // CONCLUSÕES
    // ========================================
    console.log('\n' + '═'.repeat(80));
    console.log('\n💡 CONCLUSÕES:\n');

    const conclusions: string[] = [];

    // Conclusão 1: Circuitos
    if (Math.abs(spiritualActual - spiritualExpected) > 1) {
        conclusions.push(`✅ Circuito Espiritual (3,6,9) ${spiritualActual > spiritualExpected ? 'ACIMA' : 'ABAIXO'} do esperado (${(spiritualActual - spiritualExpected).toFixed(2)}%)`);
    } else {
        conclusions.push(`➖ Circuito Espiritual (3,6,9) dentro do esperado`);
    }

    // Conclusão 2: Oscilação
    if (oscillationRate > 52) {
        conclusions.push(`✅ Oscilação 3↔6 ACIMA do aleatório (${oscillationRate.toFixed(2)}%)`);
    } else if (oscillationRate < 48) {
        conclusions.push(`⚠️  Oscilação 3↔6 ABAIXO do aleatório (${oscillationRate.toFixed(2)}%)`);
    } else {
        conclusions.push(`➖ Oscilação 3↔6 normal`);
    }

    conclusions.forEach(c => console.log(c));

    console.log('\n' + '═'.repeat(80));
    console.log('\n✅ Análise concluída!');

    await prisma.$disconnect();
}

analyzeRodinPatterns()
    .then(() => {
        console.log('\n🎯 Próximo passo: Analisar resultados e decidir implementação!');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n❌ Erro:', error);
        process.exit(1);
    });
