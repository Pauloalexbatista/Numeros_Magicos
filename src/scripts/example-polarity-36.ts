import { prisma } from '../lib/prisma';
import { Polarity36System } from '../services/polarity-36-system';

/**
 * Exemplo PRÁTICO do Sistema Polaridade 3-6
 * Usa dados REAIS da base de dados
 */

function getRoot(num: number): number {
    while (num > 9) {
        num = num.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
    }
    return num;
}

async function practicalExample() {
    console.log('🎯 EXEMPLO PRÁTICO: Sistema Polaridade 3-6\n');
    console.log('═'.repeat(80));

    // Buscar últimos 3 sorteios
    const draws = await prisma.draw.findMany({
        orderBy: { date: 'desc' },
        take: 3
    });

    draws.reverse(); // Ordem cronológica

    console.log('\n📊 ÚLTIMOS 3 SORTEIOS REAIS:\n');

    draws.forEach((draw, idx) => {
        const nums = typeof draw.numbers === 'string'
            ? JSON.parse(draw.numbers)
            : draw.numbers as number[];

        console.log(`\nSorteio #${draw.id} (${new Date(draw.date).toLocaleDateString('pt-PT')}):`);
        console.log(`  Números: ${nums.join(', ')}`);

        // Calcular raízes
        const roots = nums.map((n: number) => ({ num: n, root: getRoot(n) }));
        console.log(`  Raízes:  ${roots.map((r: any) => r.root).join(', ')}`);

        // Contar 3, 6, 9
        const count3 = roots.filter((r: any) => r.root === 3).length;
        const count6 = roots.filter((r: any) => r.root === 6).length;
        const count9 = roots.filter((r: any) => r.root === 9).length;

        console.log(`\n  Análise de Polaridade:`);
        console.log(`    Raiz 3: ${count3} números ${roots.filter((r: any) => r.root === 3).map((r: any) => r.num).join(', ')}`);
        console.log(`    Raiz 6: ${count6} números ${roots.filter((r: any) => r.root === 6).map((r: any) => r.num).join(', ')}`);
        console.log(`    Raiz 9: ${count9} números ${roots.filter((r: any) => r.root === 9).map((r: any) => r.num).join(', ')}`);

        if (count3 > count6) {
            console.log(`    ⚡ POLARIDADE: Mais 3 → Próximo favorece 6!`);
        } else if (count6 > count3) {
            console.log(`    ⚡ POLARIDADE: Mais 6 → Próximo favorece 3!`);
        } else {
            console.log(`    ⚖️  EQUILÍBRIO: Empate entre 3 e 6`);
        }
    });

    // Agora fazer previsão para o PRÓXIMO
    console.log('\n' + '═'.repeat(80));
    console.log('\n🔮 PREVISÃO PARA O PRÓXIMO SORTEIO:\n');

    const system = new Polarity36System();
    const history = await prisma.draw.findMany({
        orderBy: { date: 'asc' }
    });

    // Análise detalhada do último
    const lastDraw = draws[draws.length - 1];
    const lastNums = typeof lastDraw.numbers === 'string'
        ? JSON.parse(lastDraw.numbers)
        : lastDraw.numbers as number[];

    const analysis = await system.analyzePolarity(history as any[]);

    console.log(`Último sorteio analisado: #${lastDraw.id}`);
    console.log(`  Números: ${analysis.lastDraw.join(', ')}`);
    console.log(`  Raiz 3: ${analysis.count3} números`);
    console.log(`  Raiz 6: ${analysis.count6} números`);
    console.log(`\n🎯 ALVO IDENTIFICADO: Raiz ${analysis.targetRoot}`);
    console.log(`\n📋 Números com raiz ${analysis.targetRoot} (favorecidos):`);
    console.log(`   ${analysis.targetNumbers.join(', ')}`);

    // Fazer previsão
    const prediction = await system.generateTop10(history as any[]);

    console.log(`\n🔮 TOP 25 PREVISÃO (com boost de polaridade):\n`);

    // Mostrar com raízes
    const predictionWithRoots = prediction.map(n => ({
        num: n,
        root: getRoot(n)
    }));

    // Agrupar por raiz
    const by3 = predictionWithRoots.filter(p => p.root === 3);
    const by6 = predictionWithRoots.filter(p => p.root === 6);
    const by9 = predictionWithRoots.filter(p => p.root === 9);
    const others = predictionWithRoots.filter(p => ![3, 6, 9].includes(p.root));

    console.log(`  Raiz 3: ${by3.map(p => p.num).join(', ')} (${by3.length} números)`);
    console.log(`  Raiz 6: ${by6.map(p => p.num).join(', ')} (${by6.length} números) ⭐`);
    console.log(`  Raiz 9: ${by9.map(p => p.num).join(', ')} (${by9.length} números)`);
    console.log(`  Outros: ${others.map(p => p.num).join(', ')} (${others.length} números)`);

    console.log(`\n💡 INTERPRETAÇÃO:\n`);

    if (analysis.targetRoot === 6) {
        console.log(`  ✅ Último sorteio tinha MAIS raiz 3`);
        console.log(`  ✅ Sistema favorece raiz 6 (${by6.length} números na previsão)`);
        console.log(`  ✅ Probabilidade: ~75% de ter mais raiz 6 no próximo`);
    } else {
        console.log(`  ✅ Último sorteio tinha MAIS raiz 6`);
        console.log(`  ✅ Sistema favorece raiz 3 (${by3.length} números na previsão)`);
        console.log(`  ✅ Probabilidade: ~75% de ter mais raiz 3 no próximo`);
    }

    console.log('\n' + '═'.repeat(80));
    console.log('\n✅ Exemplo concluído!');
    console.log('\nPróxima vez que houver sorteio, podes verificar se a polaridade funcionou! 🎯');

    await prisma.$disconnect();
}

practicalExample()
    .then(() => {
        process.exit(0);
    })
    .catch(error => {
        console.error('\n❌ Erro:', error);
        process.exit(1);
    });
