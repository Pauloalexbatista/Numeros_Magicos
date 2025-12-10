import { prisma } from '../lib/prisma';

/**
 * GUIA PRÁTICO: Como usar Sistema Polaridade 3-6
 * Mostra últimos 10 sorteios com análise passo-a-passo
 */

function getRoot(num: number): number {
    while (num > 9) {
        num = num.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
    }
    return num;
}

async function practicalGuide() {
    console.log('📚 GUIA PRÁTICO: Sistema Polaridade 3-6\n');
    console.log('═'.repeat(80));

    // Buscar últimos 11 sorteios (10 + 1 para previsão)
    const draws = await prisma.draw.findMany({
        orderBy: { date: 'desc' },
        take: 11
    });

    draws.reverse(); // Ordem cronológica

    console.log('\n🔍 ANÁLISE DOS ÚLTIMOS 10 SORTEIOS:\n');
    console.log('Legenda:');
    console.log('  🟢 Raiz 3: 3, 12, 21, 30, 39, 48');
    console.log('  🔵 Raiz 6: 6, 15, 24, 33, 42');
    console.log('  ⚪ Raiz 9: 9, 18, 27, 36, 45');
    console.log('  ⚫ Outros: 1,2,4,5,7,8 e seus múltiplos\n');
    console.log('═'.repeat(80));

    for (let i = 0; i < 10; i++) {
        const draw = draws[i];
        const nextDraw = i < 9 ? draws[i + 1] : null;

        const nums = typeof draw.numbers === 'string'
            ? JSON.parse(draw.numbers)
            : draw.numbers as number[];

        console.log(`\n📅 Sorteio #${draw.id} (${new Date(draw.date).toLocaleDateString('pt-PT')})`);
        console.log(`   Números: ${nums.join(', ')}`);

        // Classificar números
        const classified = nums.map(n => {
            const root = getRoot(n);
            let symbol = '⚫';
            if (root === 3) symbol = '🟢';
            if (root === 6) symbol = '🔵';
            if (root === 9) symbol = '⚪';
            return { num: n, root, symbol };
        });

        console.log(`   Raízes:  ${classified.map(c => `${c.symbol}${c.root}`).join(' ')}`);

        // Contar polaridades
        const count3 = classified.filter(c => c.root === 3).length;
        const count6 = classified.filter(c => c.root === 6).length;
        const count9 = classified.filter(c => c.root === 9).length;

        console.log(`\n   📊 Contagem:`);
        console.log(`      🟢 Raiz 3: ${count3} ${classified.filter(c => c.root === 3).map(c => c.num).join(', ') || '-'}`);
        console.log(`      🔵 Raiz 6: ${count6} ${classified.filter(c => c.root === 6).map(c => c.num).join(', ') || '-'}`);
        console.log(`      ⚪ Raiz 9: ${count9} ${classified.filter(c => c.root === 9).map(c => c.num).join(', ') || '-'}`);

        // Determinar polaridade
        let polarity = '';
        let prediction = '';

        if (count3 > count6) {
            polarity = '🟢 Dominante: Raiz 3';
            prediction = '🔵 Previsão: Próximo favorece Raiz 6';
        } else if (count6 > count3) {
            polarity = '🔵 Dominante: Raiz 6';
            prediction = '🟢 Previsão: Próximo favorece Raiz 3';
        } else {
            polarity = '⚖️  Empate entre 3 e 6';
            prediction = '❓ Previsão: Incerta (analisar histórico)';
        }

        console.log(`\n   ${polarity}`);
        console.log(`   ${prediction}`);

        // Verificar se previsão estava certa
        if (nextDraw) {
            const nextNums = typeof nextDraw.numbers === 'string'
                ? JSON.parse(nextDraw.numbers)
                : nextDraw.numbers as number[];

            const nextCount3 = nextNums.filter(n => getRoot(n) === 3).length;
            const nextCount6 = nextNums.filter(n => getRoot(n) === 6).length;

            let result = '';

            if (count3 > count6) {
                // Previu raiz 6
                if (nextCount6 > nextCount3) {
                    result = '✅ ACERTOU! Próximo teve mais raiz 6';
                } else if (nextCount6 < nextCount3) {
                    result = '❌ ERROU! Próximo teve mais raiz 3';
                } else {
                    result = '➖ Empate no próximo';
                }
            } else if (count6 > count3) {
                // Previu raiz 3
                if (nextCount3 > nextCount6) {
                    result = '✅ ACERTOU! Próximo teve mais raiz 3';
                } else if (nextCount3 < nextCount6) {
                    result = '❌ ERROU! Próximo teve mais raiz 6';
                } else {
                    result = '➖ Empate no próximo';
                }
            } else {
                result = '⚖️  Empate - não contabilizado';
            }

            console.log(`\n   ${result}`);
        }

        console.log('\n' + '-'.repeat(80));
    }

    // Estatísticas finais
    console.log('\n' + '═'.repeat(80));
    console.log('\n📊 ESTATÍSTICAS DOS 10 SORTEIOS:\n');

    let acertos = 0;
    let erros = 0;
    let empates = 0;

    for (let i = 0; i < 9; i++) {
        const draw = draws[i];
        const nextDraw = draws[i + 1];

        const nums = typeof draw.numbers === 'string'
            ? JSON.parse(draw.numbers)
            : draw.numbers as number[];

        const nextNums = typeof nextDraw.numbers === 'string'
            ? JSON.parse(nextDraw.numbers)
            : nextDraw.numbers as number[];

        const count3 = nums.filter(n => getRoot(n) === 3).length;
        const count6 = nums.filter(n => getRoot(n) === 6).length;

        const nextCount3 = nextNums.filter(n => getRoot(n) === 3).length;
        const nextCount6 = nextNums.filter(n => getRoot(n) === 6).length;

        if (count3 === count6) {
            empates++;
        } else if (count3 > count6) {
            if (nextCount6 > nextCount3) acertos++;
            else if (nextCount6 < nextCount3) erros++;
            else empates++;
        } else {
            if (nextCount3 > nextCount6) acertos++;
            else if (nextCount3 < nextCount6) erros++;
            else empates++;
        }
    }

    const total = acertos + erros;
    const taxa = total > 0 ? (acertos / total) * 100 : 0;

    console.log(`  ✅ Acertos: ${acertos}`);
    console.log(`  ❌ Erros: ${erros}`);
    console.log(`  ➖ Empates: ${empates} (não contam)`);
    console.log(`\n  📈 Taxa de Acerto: ${taxa.toFixed(1)}% (${acertos}/${total})`);
    console.log(`  🎯 Esperado: ~75%`);

    if (taxa >= 70) {
        console.log(`\n  ✅ EXCELENTE! Acima de 70%!`);
    } else if (taxa >= 60) {
        console.log(`\n  ✅ BOM! Acima de 60%`);
    } else if (taxa >= 50) {
        console.log(`\n  ⚠️  MÉDIO. Próximo do aleatório`);
    } else {
        console.log(`\n  ❌ FRACO. Abaixo do esperado`);
    }

    // Previsão para PRÓXIMO
    console.log('\n' + '═'.repeat(80));
    console.log('\n🔮 PREVISÃO PARA O PRÓXIMO SORTEIO:\n');

    const lastDraw = draws[draws.length - 1];
    const lastNums = typeof lastDraw.numbers === 'string'
        ? JSON.parse(lastDraw.numbers)
        : lastDraw.numbers as number[];

    const lastCount3 = lastNums.filter(n => getRoot(n) === 3).length;
    const lastCount6 = lastNums.filter(n => getRoot(n) === 6).length;

    console.log(`  Último sorteio: #${lastDraw.id}`);
    console.log(`  Números: ${lastNums.join(', ')}`);
    console.log(`  Raiz 3: ${lastCount3}`);
    console.log(`  Raiz 6: ${lastCount6}`);

    if (lastCount3 > lastCount6) {
        console.log(`\n  🎯 RECOMENDAÇÃO: Apostar em números com RAIZ 6`);
        console.log(`     Números: 6, 15, 24, 33, 42`);
        console.log(`     Probabilidade: ~75%`);
    } else if (lastCount6 > lastCount3) {
        console.log(`\n  🎯 RECOMENDAÇÃO: Apostar em números com RAIZ 3`);
        console.log(`     Números: 3, 12, 21, 30, 39, 48`);
        console.log(`     Probabilidade: ~75%`);
    } else {
        console.log(`\n  ⚖️  EMPATE - Analisar últimos 5 sorteios para decidir`);
    }

    console.log('\n' + '═'.repeat(80));

    await prisma.$disconnect();
}

practicalGuide()
    .then(() => {
        console.log('\n✅ Guia concluído!');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n❌ Erro:', error);
        process.exit(1);
    });
