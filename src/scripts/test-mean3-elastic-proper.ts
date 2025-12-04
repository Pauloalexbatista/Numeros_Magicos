import { prisma } from '../lib/prisma';

async function main() {
    console.log('🔬 TESTE: Média ±3 + Filtro Elástico (direção)\n');

    const allDraws = await prisma.draw.findMany({
        orderBy: { date: 'asc' }
    });

    const parsedDraws = allDraws.map(d => ({
        numbers: JSON.parse(d.numbers) as number[]
    }));

    let hits = 0;
    let totalTests = 0;
    let totalNumbersAfterFilter = 0;

    const testStart = Math.max(100, parsedDraws.length - 100);

    for (let i = testStart; i < parsedDraws.length; i++) {
        const history = parsedDraws.slice(0, i);
        if (history.length < 50) continue;

        const recent50 = history.slice(-50);
        const lastDraw = history[history.length - 1].numbers;

        // STEP 1: Generate candidates with Mean ±3 per position
        const candidatesByPosition: Set<number>[] = [new Set(), new Set(), new Set(), new Set(), new Set()];

        for (let pos = 0; pos < 5; pos++) {
            const values = recent50.map(d => d.numbers[pos]);
            const mean = values.reduce((a, b) => a + b, 0) / values.length;

            for (let offset = -3; offset <= 3; offset++) {
                const num = Math.round(mean) + offset;
                if (num >= 1 && num <= 50) {
                    candidatesByPosition[pos].add(num);
                }
            }
        }

        // STEP 2: Calculate elastic direction for each position
        const means = [0, 0, 0, 0, 0].map((_, pos) =>
            recent50.reduce((sum, d) => sum + d.numbers[pos], 0) / 50
        );

        // STEP 3: Filter candidates by elastic direction
        const filteredByPosition: Set<number>[] = [new Set(), new Set(), new Set(), new Set(), new Set()];

        for (let pos = 0; pos < 5; pos++) {
            const lastVal = lastDraw[pos];
            const mean = means[pos];
            const candidates = Array.from(candidatesByPosition[pos]);

            if (lastVal < mean) {
                // Should go UP: accept numbers >= lastVal
                candidates.forEach(n => {
                    if (n >= lastVal) filteredByPosition[pos].add(n);
                });
            } else if (lastVal > mean) {
                // Should go DOWN: accept numbers <= lastVal
                candidates.forEach(n => {
                    if (n <= lastVal) filteredByPosition[pos].add(n);
                });
            } else {
                // Equal: accept all
                candidates.forEach(n => filteredByPosition[pos].add(n));
            }
        }

        // STEP 4: Union of all filtered numbers
        const finalPrediction = new Set<number>();
        filteredByPosition.forEach(set => {
            set.forEach(n => finalPrediction.add(n));
        });

        const finalArray = Array.from(finalPrediction);
        totalNumbersAfterFilter += finalArray.length;

        const actual = parsedDraws[i].numbers;
        const hit = actual.filter(n => finalArray.includes(n)).length;

        hits += hit;
        totalTests++;
    }

    const accuracy = (hits / (totalTests * 5)) * 100;
    const avgNumbers = totalNumbersAfterFilter / totalTests;

    console.log('='.repeat(70));
    console.log('📊 RESULTADO: Média ±3 + Filtro Elástico');
    console.log('='.repeat(70));
    console.log(`Total testes: ${totalTests}`);
    console.log(`Números após filtro (média): ${avgNumbers.toFixed(1)}`);
    console.log(`Total hits: ${hits}/${totalTests * 5}`);
    console.log(`Acerto: ${accuracy.toFixed(1)}%`);

    console.log(`\n💡 COMPARAÇÃO JUSTA (todos com ~25 números):`);
    console.log(`   Standard Deviation (25 nums): 54.2%`);
    console.log(`   Este sistema (${avgNumbers.toFixed(0)} nums): ${accuracy.toFixed(1)}%`);

    if (avgNumbers >= 20 && avgNumbers <= 30) {
        console.log(`   ✅ Número de candidatos está na faixa correta!`);

        if (accuracy > 54.2) {
            console.log(`   🏆 MELHOR que StdDev (+${(accuracy - 54.2).toFixed(1)}%)`);
        } else if (accuracy > 50) {
            console.log(`   ✅ Melhor que baseline (+${(accuracy - 50).toFixed(1)}%)`);
        }
    } else {
        console.log(`   ⚠️ Número de candidatos fora da faixa esperada`);
    }
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
