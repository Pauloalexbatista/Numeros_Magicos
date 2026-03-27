import { prisma } from '../lib/prisma';

/**
 * TESTE: Sequência 3-9-6-9-3 (Polaridade com Eixo)
 * 
 * Hipótese: O 9 funciona como "eixo" entre 3 e 6
 * Sequência esperada: 3 → 9 → 6 → 9 → 3 → 9 → 6
 */

function getRoot(num: number): number {
    while (num > 9) {
        num = num.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
    }
    return num;
}

async function test396Sequence() {
    console.log('🔬 TESTE: Sequência 3-9-6 (Polaridade com Eixo)\n');
    console.log('═'.repeat(80));

    const draws = await prisma.draw.findMany({
        orderBy: { date: 'asc' }
    });

    const allDrawNumbers = draws.map(d => {
        const nums = typeof d.numbers === 'string' ? (typeof d.numbers === "string" ? JSON.parse(d.numbers) : d.numbers) : d.numbers;
        return nums as number[];
    });

    console.log(`Total de sorteios: ${draws.length}\n`);

    // Identificar dominante de cada sorteio
    const sequence: number[] = [];

    allDrawNumbers.forEach(nums => {
        const count3 = nums.filter(n => getRoot(n) === 3).length;
        const count6 = nums.filter(n => getRoot(n) === 6).length;
        const count9 = nums.filter(n => getRoot(n) === 9).length;

        // Determinar dominante
        const max = Math.max(count3, count6, count9);

        if (count3 === max && count3 > 0) {
            sequence.push(3);
        } else if (count6 === max && count6 > 0) {
            sequence.push(6);
        } else if (count9 === max && count9 > 0) {
            sequence.push(9);
        } else {
            sequence.push(0); // Sem dominante claro
        }
    });

    console.log('📊 ANÁLISE DE SEQUÊNCIAS:\n');

    // Contar transições
    const transitions: Record<string, number> = {};

    for (let i = 0; i < sequence.length - 1; i++) {
        if (sequence[i] !== 0 && sequence[i + 1] !== 0) {
            const key = `${sequence[i]}→${sequence[i + 1]}`;
            transitions[key] = (transitions[key] || 0) + 1;
        }
    }

    // Mostrar todas as transições
    console.log('Todas as transições encontradas:\n');
    const sorted = Object.entries(transitions)
        .sort(([, a], [, b]) => b - a);

    sorted.forEach(([trans, count]) => {
        console.log(`  ${trans}: ${count} vezes`);
    });

    // Analisar padrões específicos
    console.log('\n' + '═'.repeat(80));
    console.log('\n🎯 PADRÕES ESPERADOS (Tesla-Rodin):\n');

    const expected = [
        '3→9', '9→6', '6→9', '9→3',  // Sequência com eixo
        '3→6', '6→3'  // Oscilação direta
    ];

    expected.forEach(pattern => {
        const count = transitions[pattern] || 0;
        console.log(`  ${pattern}: ${count} vezes`);
    });

    // Calcular taxas
    const total39 = (transitions['3→9'] || 0);
    const total96 = (transitions['9→6'] || 0);
    const total69 = (transitions['6→9'] || 0);
    const total93 = (transitions['9→3'] || 0);
    const total36 = (transitions['3→6'] || 0);
    const total63 = (transitions['6→3'] || 0);

    const totalWithAxis = total39 + total96 + total69 + total93;
    const totalDirect = total36 + total63;
    const totalAll = Object.values(transitions).reduce((sum, v) => sum + v, 0);

    console.log('\n' + '═'.repeat(80));
    console.log('\n📊 ESTATÍSTICAS:\n');

    console.log(`Transições com EIXO (3→9→6→9→3):`);
    console.log(`  Total: ${totalWithAxis} (${(totalWithAxis / totalAll * 100).toFixed(1)}%)`);

    console.log(`\nTransições DIRETAS (3↔6):`);
    console.log(`  Total: ${totalDirect} (${(totalDirect / totalAll * 100).toFixed(1)}%)`);

    console.log(`\nOutras transições:`);
    const others = totalAll - totalWithAxis - totalDirect;
    console.log(`  Total: ${others} (${(others / totalAll * 100).toFixed(1)}%)`);

    // Verificar se 9 é realmente eixo
    console.log('\n' + '═'.repeat(80));
    console.log('\n🔍 O 9 É REALMENTE UM EIXO?\n');

    const from9 = (transitions['9→3'] || 0) + (transitions['9→6'] || 0);
    const to9 = (transitions['3→9'] || 0) + (transitions['6→9'] || 0);
    const through9 = Math.min(from9, to9);

    console.log(`Transições PARA o 9: ${to9}`);
    console.log(`Transições DO 9: ${from9}`);
    console.log(`Passagens ATRAVÉS do 9: ${through9}`);

    const rate9 = (through9 / totalAll) * 100;
    console.log(`\nTaxa de uso do 9 como eixo: ${rate9.toFixed(1)}%`);

    if (rate9 > 20) {
        console.log(`✅ SIM! O 9 funciona como eixo (${rate9.toFixed(1)}%)`);
    } else {
        console.log(`❌ NÃO. O 9 não é usado como eixo (${rate9.toFixed(1)}%)`);
    }

    // Comparar com oscilação direta 3↔6
    console.log('\n' + '═'.repeat(80));
    console.log('\n💡 COMPARAÇÃO:\n');

    console.log(`Oscilação DIRETA 3↔6: ${totalDirect} vezes`);
    console.log(`Oscilação COM EIXO 3→9→6: ${totalWithAxis} vezes`);

    if (totalDirect > totalWithAxis) {
        console.log(`\n✅ Oscilação DIRETA é mais comum!`);
        console.log(`   3 e 6 alternam SEM passar pelo 9`);
    } else {
        console.log(`\n✅ Oscilação COM EIXO é mais comum!`);
        console.log(`   3 e 6 alternam ATRAVÉS do 9`);
    }

    console.log('\n' + '═'.repeat(80));

    await prisma.$disconnect();
}

test396Sequence()
    .then(() => {
        console.log('\n✅ Teste concluído!');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n❌ Erro:', error);
        process.exit(1);
    });
