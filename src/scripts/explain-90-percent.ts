import { prisma } from '../lib/prisma';

async function main() {
    console.log('📊 EXEMPLO PRÁTICO: Como funciona o 90%\n');

    const allDraws = await prisma.draw.findMany({
        orderBy: { date: 'asc' }
    });

    const parsedDraws = allDraws.map(d => JSON.parse(d.numbers) as number[]);

    // Get Hot Numbers from history
    const frequency: Record<number, number> = {};
    for (let i = 1; i <= 50; i++) frequency[i] = 0;

    parsedDraws.forEach(draw => {
        draw.forEach(num => frequency[num]++);
    });

    const hotNumbers = Object.entries(frequency)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 25)
        .map(([num]) => parseInt(num));

    const coldNumbers = Object.entries(frequency)
        .sort(([, a], [, b]) => a - b)
        .slice(0, 25)
        .map(([num]) => parseInt(num));

    console.log('🔥 Hot Numbers (top 25 mais frequentes):');
    console.log(hotNumbers.join(', '));
    console.log('\n❄️ Cold Numbers (top 25 menos frequentes):');
    console.log(coldNumbers.join(', '));

    // Test last 10 draws
    console.log('\n' + '='.repeat(70));
    console.log('📋 ÚLTIMOS 10 SORTEIOS - ANÁLISE DETALHADA');
    console.log('='.repeat(70));

    const last10 = parsedDraws.slice(-10);

    let totalHotAppeared = 0;
    let totalColdAppeared = 0;
    let totalHotDidNotAppear = 0;
    let totalColdDidNotAppear = 0;

    last10.forEach((draw, index) => {
        const hotInDraw = draw.filter(n => hotNumbers.includes(n));
        const coldInDraw = draw.filter(n => coldNumbers.includes(n));
        const hotNotInDraw = hotNumbers.filter(n => !draw.includes(n));
        const coldNotInDraw = coldNumbers.filter(n => !draw.includes(n));

        totalHotAppeared += hotInDraw.length;
        totalColdAppeared += coldInDraw.length;
        totalHotDidNotAppear += hotNotInDraw.length;
        totalColdDidNotAppear += coldNotInDraw.length;

        console.log(`\nSorteio ${index + 1}: ${draw.join(', ')}`);
        console.log(`  🔥 Hot que SAÍRAM: ${hotInDraw.length} → ${hotInDraw.join(', ')}`);
        console.log(`  ❄️ Cold que SAÍRAM: ${coldInDraw.length} → ${coldInDraw.join(', ')}`);
        console.log(`  🔥 Hot que NÃO saíram: ${hotNotInDraw.length}/25 (${((hotNotInDraw.length / 25) * 100).toFixed(0)}%)`);
        console.log(`  ❄️ Cold que NÃO saíram: ${coldNotInDraw.length}/25 (${((coldNotInDraw.length / 25) * 100).toFixed(0)}%)`);
    });

    console.log('\n' + '='.repeat(70));
    console.log('📊 RESUMO (10 sorteios)');
    console.log('='.repeat(70));

    const avgHotAppeared = totalHotAppeared / 10;
    const avgColdAppeared = totalColdAppeared / 10;
    const avgHotNotAppeared = totalHotDidNotAppear / 10;
    const avgColdNotAppeared = totalColdDidNotAppear / 10;

    console.log(`\n🔥 HOT NUMBERS (25):`);
    console.log(`   Apareceram (média): ${avgHotAppeared.toFixed(1)}/5 por sorteio`);
    console.log(`   NÃO apareceram: ${avgHotNotAppeared.toFixed(1)}/25 = ${((avgHotNotAppeared / 25) * 100).toFixed(0)}%`);

    console.log(`\n❄️ COLD NUMBERS (25):`);
    console.log(`   Apareceram (média): ${avgColdAppeared.toFixed(1)}/5 por sorteio`);
    console.log(`   NÃO apareceram: ${avgColdNotAppeared.toFixed(1)}/25 = ${((avgColdNotAppeared / 25) * 100).toFixed(0)}%`);

    console.log(`\n💡 CONCLUSÃO:`);
    console.log(`   Dos 5 números que saem:`);
    console.log(`   - ${avgHotAppeared.toFixed(1)} são Hot (${((avgHotAppeared / 5) * 100).toFixed(0)}%)`);
    console.log(`   - ${avgColdAppeared.toFixed(1)} são Cold (${((avgColdAppeared / 5) * 100).toFixed(0)}%)`);
    console.log(`\n   Os 5 vencedores estão MISTURADOS entre Hot e Cold!`);
    console.log(`   Não estão "todos nos outros 25"`);
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
