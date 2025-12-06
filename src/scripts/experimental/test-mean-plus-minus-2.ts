import { prisma } from '../../lib/prisma';

async function main() {
    console.log('🧪 TESTE: Média ±2 vs Standard Deviation\n');

    const allDraws = await prisma.draw.findMany({
        orderBy: { date: 'asc' }
    });

    const parsedDraws = allDraws.map(d => JSON.parse(d.numbers) as number[]);

    let simplifiedHits = 0;
    let stdDevHits = 0;
    let totalTests = 0;

    const testStart = Math.max(100, parsedDraws.length - 100);

    for (let i = testStart; i < parsedDraws.length; i++) {
        const history = parsedDraws.slice(0, i);
        if (history.length < 50) continue;

        const recent50 = history.slice(-50);

        // SIMPLIFIED: Mean ±2
        const simplifiedNumbers = new Set<number>();

        for (let pos = 0; pos < 5; pos++) {
            const values = recent50.map(d => d[pos]);
            const mean = values.reduce((a, b) => a + b, 0) / values.length;

            for (let offset = -2; offset <= 2; offset++) {
                const num = Math.round(mean) + offset;
                if (num >= 1 && num <= 50) simplifiedNumbers.add(num);
            }
        }

        // STANDARD DEVIATION: Mean ± StdDev and ±1
        const stdDevNumbers = new Set<number>();

        for (let pos = 0; pos < 5; pos++) {
            const values = recent50.map(d => d[pos]);
            const mean = values.reduce((a, b) => a + b, 0) / values.length;

            const squareDiffs = values.map(v => Math.pow(v - mean, 2));
            const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / squareDiffs.length;
            const stdDev = Math.sqrt(avgSquareDiff);

            const targets = [
                Math.round(mean - stdDev),
                Math.round(mean - 1),
                Math.round(mean),
                Math.round(mean + 1),
                Math.round(mean + stdDev)
            ];

            targets.forEach(t => {
                if (t >= 1 && t <= 50) stdDevNumbers.add(t);
            });
        }

        const actual = parsedDraws[i];

        simplifiedHits += actual.filter(n => Array.from(simplifiedNumbers).includes(n)).length;
        stdDevHits += actual.filter(n => Array.from(stdDevNumbers).includes(n)).length;
        totalTests++;
    }

    const simplifiedAcc = (simplifiedHits / (totalTests * 5)) * 100;
    const stdDevAcc = (stdDevHits / (totalTests * 5)) * 100;

    console.log('='.repeat(70));
    console.log('📊 COMPARAÇÃO');
    console.log('='.repeat(70));
    console.log(`\nSimplificado (Média ±2):`);
    console.log(`   Hits: ${simplifiedHits}/${totalTests * 5}`);
    console.log(`   Acerto: ${simplifiedAcc.toFixed(1)}%`);

    console.log(`\nStandard Deviation (Média ±1 e ±Desvio):`);
    console.log(`   Hits: ${stdDevHits}/${totalTests * 5}`);
    console.log(`   Acerto: ${stdDevAcc.toFixed(1)}%`);

    console.log(`\n💡 Conclusão:`);
    if (Math.abs(simplifiedAcc - stdDevAcc) < 0.5) {
        console.log(`   ✅ SÃO PRATICAMENTE IGUAIS!`);
        console.log(`   → Podes usar só Média ±2 (mais simples)`);
    } else if (simplifiedAcc > stdDevAcc) {
        console.log(`   🏆 Simplificado é MELHOR (+${(simplifiedAcc - stdDevAcc).toFixed(1)}%)`);
    } else {
        console.log(`   📊 Standard Deviation é melhor (+${(stdDevAcc - simplifiedAcc).toFixed(1)}%)`);
    }
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
