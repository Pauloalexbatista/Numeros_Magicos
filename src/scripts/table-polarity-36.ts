import { prisma } from '../lib/prisma';

/**
 * TABELA CLARA: Sistema Polaridade 3-6
 * Mostra 15 sorteios em formato tabela simples
 */

function getRoot(num: number): number {
    while (num > 9) {
        num = num.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
    }
    return num;
}

async function clearTable() {
    console.log('📊 TABELA: Sistema Polaridade 3-6\n');
    console.log('═'.repeat(120));

    const draws = await prisma.draw.findMany({
        orderBy: { date: 'desc' },
        take: 16 // 15 + 1 para verificação
    });

    draws.reverse();

    console.log('\n🔑 LEGENDA:');
    console.log('  Raiz 3: Números 3, 12, 21, 30, 39, 48');
    console.log('  Raiz 6: Números 6, 15, 24, 33, 42');
    console.log('  Outros: Todos os restantes\n');

    // Header
    console.log('┌──────┬────────────┬───────────────────────┬────────┬────────┬──────────────┬──────────────────┬────────────┐');
    console.log('│  #   │    Data    │       Números         │ Raiz 3 │ Raiz 6 │  Dominante   │  Aposta Próximo  │ Resultado  │');
    console.log('├──────┼────────────┼───────────────────────┼────────┼────────┼──────────────┼──────────────────┼────────────┤');

    const data: any[] = [];

    for (let i = 0; i < 15; i++) {
        const draw = draws[i];
        const nextDraw = i < 14 ? draws[i + 1] : null;

        const nums = typeof draw.numbers === 'string'
            ? JSON.parse(draw.numbers)
            : draw.numbers as number[];

        const count3 = nums.filter((n: number) => getRoot(n) === 3).length;
        const count6 = nums.filter((n: number) => getRoot(n) === 6).length;

        let dominant = '';
        let bet = '';
        let result = '';

        if (count3 > count6) {
            dominant = 'Raiz 3';
            bet = 'Raiz 6';
        } else if (count6 > count3) {
            dominant = 'Raiz 6';
            bet = 'Raiz 3';
        } else {
            dominant = 'Empate';
            bet = 'Incerto';
        }

        // Verificar resultado
        if (nextDraw && dominant !== 'Empate') {
            const nextNums = typeof nextDraw.numbers === 'string'
                ? JSON.parse(nextDraw.numbers)
                : nextDraw.numbers as number[];

            const nextCount3 = nextNums.filter((n: number) => getRoot(n) === 3).length;
            const nextCount6 = nextNums.filter((n: number) => getRoot(n) === 6).length;

            if (bet === 'Raiz 6') {
                result = nextCount6 > nextCount3 ? '✅ Acertou' : nextCount6 < nextCount3 ? '❌ Errou' : '➖ Empate';
            } else if (bet === 'Raiz 3') {
                result = nextCount3 > nextCount6 ? '✅ Acertou' : nextCount3 < nextCount6 ? '❌ Errou' : '➖ Empate';
            }
        } else if (nextDraw) {
            result = '⚖️  N/A';
        }

        data.push({
            id: draw.id,
            date: new Date(draw.date).toLocaleDateString('pt-PT'),
            nums: nums.join(','),
            count3,
            count6,
            dominant,
            bet,
            result
        });

        const numStr = nums.join(',').padEnd(21);
        const dateStr = new Date(draw.date).toLocaleDateString('pt-PT').padEnd(10);
        const dominantStr = dominant.padEnd(12);
        const betStr = bet.padEnd(16);
        const resultStr = result.padEnd(10);

        console.log(`│ ${draw.id.toString().padStart(4)} │ ${dateStr} │ ${numStr} │   ${count3}    │   ${count6}    │ ${dominantStr} │ ${betStr} │ ${resultStr} │`);
    }

    console.log('└──────┴────────────┴───────────────────────┴────────┴────────┴──────────────┴──────────────────┴────────────┘');

    // Estatísticas
    console.log('\n' + '═'.repeat(120));
    console.log('\n📊 ESTATÍSTICAS:\n');

    const acertos = data.filter(d => d.result === '✅ Acertou').length;
    const erros = data.filter(d => d.result === '❌ Errou').length;
    const empates = data.filter(d => d.result === '➖ Empate' || d.result === '⚖️  N/A').length;

    const total = acertos + erros;
    const taxa = total > 0 ? (acertos / total) * 100 : 0;

    console.log(`  Total de apostas: ${total}`);
    console.log(`  ✅ Acertos: ${acertos}`);
    console.log(`  ❌ Erros: ${erros}`);
    console.log(`  ➖ Empates/N/A: ${empates}`);
    console.log(`\n  📈 Taxa de Acerto: ${taxa.toFixed(1)}%`);
    console.log(`  🎯 Esperado: ~75%\n`);

    // Explicação
    console.log('═'.repeat(120));
    console.log('\n💡 COMO LER A TABELA:\n');
    console.log('1️⃣  Coluna "Raiz 3" e "Raiz 6": Quantos números do sorteio têm cada raiz');
    console.log('2️⃣  Coluna "Dominante": Qual raiz apareceu MAIS neste sorteio');
    console.log('3️⃣  Coluna "Aposta Próximo": Em que raiz apostar para o PRÓXIMO sorteio');
    console.log('4️⃣  Coluna "Resultado": Se a aposta estava certa (comparando com próximo sorteio)\n');

    console.log('📝 REGRA SIMPLES:');
    console.log('   • Se sorteio tem MAIS raiz 3 → Aposta em raiz 6 no próximo');
    console.log('   • Se sorteio tem MAIS raiz 6 → Aposta em raiz 3 no próximo');
    console.log('   • Se empate → Não apostar (incerto)\n');

    // Exemplo prático
    console.log('═'.repeat(120));
    console.log('\n🎯 EXEMPLO PRÁTICO:\n');

    const exemplo = data.find(d => d.dominant !== 'Empate' && d.result === '✅ Acertou');

    if (exemplo) {
        console.log(`Sorteio #${exemplo.id} (${exemplo.date}):`);
        console.log(`  Números: ${exemplo.nums}`);
        console.log(`  Raiz 3: ${exemplo.count3} | Raiz 6: ${exemplo.count6}`);
        console.log(`  Dominante: ${exemplo.dominant}`);
        console.log(`  Aposta: ${exemplo.bet}`);
        console.log(`  ${exemplo.result}\n`);

        if (exemplo.dominant === 'Raiz 3') {
            console.log('  Explicação:');
            console.log(`    • Este sorteio tinha ${exemplo.count3} números com raiz 3`);
            console.log(`    • Tinha apenas ${exemplo.count6} números com raiz 6`);
            console.log('    • REGRA: Mais 3 → Aposta em 6');
            console.log('    • Números para apostar: 6, 15, 24, 33, 42');
            console.log('    • Resultado: Próximo sorteio teve mais raiz 6! ✅\n');
        } else {
            console.log('  Explicação:');
            console.log(`    • Este sorteio tinha ${exemplo.count6} números com raiz 6`);
            console.log(`    • Tinha apenas ${exemplo.count3} números com raiz 3`);
            console.log('    • REGRA: Mais 6 → Aposta em 3');
            console.log('    • Números para apostar: 3, 12, 21, 30, 39, 48');
            console.log('    • Resultado: Próximo sorteio teve mais raiz 3! ✅\n');
        }
    }

    // Próximo sorteio
    console.log('═'.repeat(120));
    console.log('\n🔮 PARA O PRÓXIMO SORTEIO:\n');

    const ultimo = data[data.length - 1];
    console.log(`Último sorteio: #${ultimo.id} (${ultimo.date})`);
    console.log(`  Números: ${ultimo.nums}`);
    console.log(`  Raiz 3: ${ultimo.count3} | Raiz 6: ${ultimo.count6}`);
    console.log(`  Dominante: ${ultimo.dominant}\n`);

    if (ultimo.bet === 'Raiz 6') {
        console.log('  🎯 APOSTA RECOMENDADA: Raiz 6');
        console.log('     Números: 6, 15, 24, 33, 42');
        console.log('     Incluir 2-3 destes números na tua aposta');
        console.log('     Probabilidade: ~75%\n');
    } else if (ultimo.bet === 'Raiz 3') {
        console.log('  🎯 APOSTA RECOMENDADA: Raiz 3');
        console.log('     Números: 3, 12, 21, 30, 39, 48');
        console.log('     Incluir 2-3 destes números na tua aposta');
        console.log('     Probabilidade: ~75%\n');
    } else {
        console.log('  ⚠️  EMPATE - Não há recomendação clara');
        console.log('     Analisar últimos 5 sorteios para decidir\n');
    }

    console.log('═'.repeat(120));

    await prisma.$disconnect();
}

clearTable()
    .then(() => {
        console.log('\n✅ Tabela concluída!');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n❌ Erro:', error);
        process.exit(1);
    });
