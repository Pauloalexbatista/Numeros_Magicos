import { prisma } from '../lib/prisma';

async function main() {
    console.log('🧪 TESTE: Média ±3 (sem filtros)\n');

    const allDraws = await prisma.draw.findMany({
        orderBy: { date: 'asc' }
    });

    const parsedDraws = allDraws.map(d => JSON.parse(d.numbers) as number[]);

    let hits = 0;
    let totalTests = 0;
    let totalNumbersUsed = 0;

    const testStart = Math.max(100, parsedDraws.length - 100);

    for (let i = testStart; i < parsedDraws.length; i++) {
        const history = parsedDraws.slice(0, i);
        if (history.length < 50) continue;

        const recent50 = history.slice(-50);

        // Mean ±3 per position
        const numbers = new Set<number>();

        for (let pos = 0; pos < 5; pos++) {
            const values = recent50.map(d => d[pos]);
            const mean = values.reduce((a, b) => a + b, 0) / values.length;

            for (let offset = -3; offset <= 3; offset++) {
                const num = Math.round(mean) + offset;
                if (num >= 1 && num <= 50) {
                    numbers.add(num);
                }
            }
        }

        const finalArray = Array.from(numbers);
        totalNumbersUsed += finalArray.length;

        const actual = parsedDraws[i];
        const hit = actual.filter(n => finalArray.includes(n)).length;

        hits += hit;
        totalTests++;
    }

    const accuracy = (hits / (totalTests * 5)) * 100;
    const avgNumbers = totalNumbersUsed / totalTests;

    console.log('='.repeat(70));
    console.log('📊 RESULTADO: Média ±3');
    console.log('='.repeat(70));
    console.log(`Total testes: ${totalTests}`);
    console.log(`Números usados (média): ${avgNumbers.toFixed(1)}`);
    console.log(`Total hits: ${hits}/${totalTests * 5}`);
    console.log(`Acerto: ${accuracy.toFixed(1)}%`);

    console.log(`\n💡 Comparação:`);
    console.log(`   Baseline (50%): 50%`);
    console.log(`   Média ±2: 49.8%`);
    console.log(`   Média ±3: ${accuracy.toFixed(1)}%`);
    console.log(`   Standard Deviation: 54.2%`);

    if (accuracy > 54) {
        console.log(`\n   🏆 MELHOR QUE STANDARD DEVIATION!`);
    } else if (accuracy > 50) {
        console.log(`\n   ✅ Melhor que baseline`);
    }
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
