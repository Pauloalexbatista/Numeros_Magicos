import { prisma } from '../../lib/prisma';

async function main() {
    console.log('🧪 TESTE DA TEORIA DA SATURAÇÃO\n');
    console.log('Hipótese: Números com BAIXA saturação têm MAIOR probabilidade de sair\n');

    const allDraws = await prisma.draw.findMany({
        orderBy: { date: 'asc' }
    });

    const parsedDraws = allDraws.map(d => JSON.parse(d.numbers) as number[]);

    let lowSatHits = 0;
    let highSatHits = 0;
    let totalTests = 0;

    // Test on last 100 draws
    const testStart = Math.max(120, parsedDraws.length - 100);

    for (let i = testStart; i < parsedDraws.length; i++) {
        const history = parsedDraws.slice(0, i);

        // Calculate saturation for each number
        const numberStats: Record<number, { max: number, current: number, saturation: number }> = {};

        for (let num = 1; num <= 50; num++) {
            let max = 0;

            // Find historical max in 20-draw windows
            for (let j = 19; j < history.length; j++) {
                const window = history.slice(j - 19, j + 1);
                const count = window.filter(d => d.includes(num)).length;
                if (count > max) max = count;
            }

            // Current count in last 20
            const recent20 = history.slice(-20);
            const current = recent20.filter(d => d.includes(num)).length;
            const saturation = max > 0 ? (current / max) * 100 : 0;

            numberStats[num] = { max, current, saturation };
        }

        // Sort by saturation
        const sorted = Object.entries(numberStats)
            .map(([num, stats]) => ({ num: parseInt(num), ...stats }))
            .sort((a, b) => a.saturation - b.saturation);

        // Get low saturation (bottom 25) and high saturation (top 25)
        const lowSat = sorted.slice(0, 25).map(n => n.num);
        const highSat = sorted.slice(-25).map(n => n.num);

        // Check actual draw
        const actual = parsedDraws[i];

        const lowHits = actual.filter(n => lowSat.includes(n)).length;
        const highHits = actual.filter(n => highSat.includes(n)).length;

        lowSatHits += lowHits;
        highSatHits += highHits;
        totalTests++;
    }

    const lowAvg = lowSatHits / totalTests;
    const highAvg = highSatHits / totalTests;
    const lowAcc = (lowSatHits / (totalTests * 5)) * 100;
    const highAcc = (highSatHits / (totalTests * 5)) * 100;

    console.log('='.repeat(70));
    console.log('📊 RESULTADOS DO TESTE');
    console.log('='.repeat(70));
    console.log(`Total de testes: ${totalTests}`);
    console.log(`\n🎯 BAIXA SATURAÇÃO (25 números menos saturados):`);
    console.log(`   Total hits: ${lowSatHits}/${totalTests * 5}`);
    console.log(`   Média por sorteio: ${lowAvg.toFixed(2)}/5`);
    console.log(`   Acerto: ${lowAcc.toFixed(1)}%`);

    console.log(`\n🔴 ALTA SATURAÇÃO (25 números mais saturados):`);
    console.log(`   Total hits: ${highSatHits}/${totalTests * 5}`);
    console.log(`   Média por sorteio: ${highAvg.toFixed(2)}/5`);
    console.log(`   Acerto: ${highAcc.toFixed(1)}%`);

    console.log(`\n💡 CONCLUSÃO:`);
    const difference = lowAcc - highAcc;

    if (difference > 2) {
        console.log(`   ✅ TEORIA VALIDADA!`);
        console.log(`   Baixa saturação é ${difference.toFixed(1)}% MELHOR que alta saturação`);
        console.log(`   → Vale a pena usar este sistema!`);
    } else if (difference > 0) {
        console.log(`   ⚠️ Leve vantagem (${difference.toFixed(1)}%)`);
        console.log(`   → Pode funcionar mas não é conclusivo`);
    } else {
        console.log(`   ❌ TEORIA REFUTADA!`);
        console.log(`   Alta saturação é ${Math.abs(difference).toFixed(1)}% melhor`);
        console.log(`   → Saturação não é um bom indicador`);
    }

    console.log(`\n📋 BASELINE:`);
    console.log(`   25 números aleatórios = 50% acerto`);
    console.log(`   Baixa saturação = ${lowAcc.toFixed(1)}%`);
    console.log(`   Alta saturação = ${highAcc.toFixed(1)}%`);
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
