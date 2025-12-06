import { prisma } from '../lib/prisma';

async function main() {
    console.log('📊 NÚMEROS MAIS FREQUENTES (Histórico Total)\n');

    const allDraws = await prisma.draw.findMany({
        orderBy: { date: 'asc' }
    });

    const frequency: Record<number, number> = {};

    // Initialize all numbers
    for (let i = 1; i <= 50; i++) {
        frequency[i] = 0;
    }

    allDraws.forEach(draw => {
        const numbers = JSON.parse(draw.numbers) as number[];
        numbers.forEach(num => {
            frequency[num]++;
        });
    });

    const sorted = Object.entries(frequency)
        .sort(([, a], [, b]) => b - a);

    console.log(`Total de sorteios: ${allDraws.length}`);
    console.log(`Total de números sorteados: ${allDraws.length * 5}\n`);

    console.log('='.repeat(70));
    console.log('🏆 TOP 10 NÚMEROS MAIS FREQUENTES');
    console.log('='.repeat(70));

    sorted.slice(0, 10).forEach(([num, count], index) => {
        const percentage = (count / allDraws.length) * 100;
        const bar = '█'.repeat(Math.round(percentage / 2));
        console.log(`${(index + 1).toString().padStart(2)}. Número ${num.padStart(2)} | ${count.toString().padStart(4)}x | ${percentage.toFixed(1)}% ${bar}`);
    });

    console.log('\n' + '='.repeat(70));
    console.log('❄️ TOP 10 NÚMEROS MAIS RAROS');
    console.log('='.repeat(70));

    sorted.slice(-10).reverse().forEach(([num, count], index) => {
        const percentage = (count / allDraws.length) * 100;
        const bar = '░'.repeat(Math.round(percentage / 2));
        console.log(`${(index + 1).toString().padStart(2)}. Número ${num.padStart(2)} | ${count.toString().padStart(4)}x | ${percentage.toFixed(1)}% ${bar}`);
    });

    // Expected frequency if perfectly random
    const expected = allDraws.length * 5 / 50;
    console.log(`\n💡 Frequência esperada (aleatório perfeito): ${expected.toFixed(0)}x`);

    const mostFrequent = sorted[0];
    const leastFrequent = sorted[sorted.length - 1];
    const difference = mostFrequent[1] - leastFrequent[1];

    console.log(`\n📈 Diferença entre mais e menos frequente: ${difference} saídas`);
    console.log(`   Mais frequente: ${mostFrequent[0]} (${mostFrequent[1]}x)`);
    console.log(`   Menos frequente: ${leastFrequent[0]} (${leastFrequent[1]}x)`);
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
