import { prisma } from '../lib/prisma';

async function main() {
    console.log('🎯 TESTE: Exatamente como StdDev (Média, ±1, ±Desvio) + Freq\n');

    const allDraws = await prisma.draw.findMany({
        orderBy: { date: 'asc' }
    });

    const parsedDraws = allDraws.map(d => ({
        numbers: JSON.parse(d.numbers) as number[]
    }));

    let hits = 0;
    let totalTests = 0;

    const testStart = Math.max(100, parsedDraws.length - 100);

    for (let i = testStart; i < parsedDraws.length; i++) {
        const history = parsedDraws.slice(0, i);
        if (history.length < 50) continue;

        const recent50 = history.slice(-50);

        // STEP 1: Generate candidates EXACTLY like Standard Deviation
        const candidates = new Set<number>();

        for (let pos = 0; pos < 5; pos++) {
            const values = recent50.map(d => d.numbers[pos]);
            const mean = values.reduce((a, b) => a + b, 0) / values.length;

            // Calculate StdDev
            const squareDiffs = values.map(value => Math.pow(value - mean, 2));
            const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / squareDiffs.length;
            const stdDev = Math.sqrt(avgSquareDiff);

            // EXACTLY the same 5 targets as Standard Deviation
            const targets = [
                Math.round(mean),           // Mean
                Math.round(mean - 1),       // Mean - 1
                Math.round(mean + 1),       // Mean + 1
                Math.round(mean + stdDev),  // Mean + StdDev
                Math.round(mean - stdDev)   // Mean - StdDev
            ];

            targets.forEach(t => {
                if (t >= 1 && t <= 50) candidates.add(t);
            });
        }

        let result = Array.from(candidates);

        // STEP 2: Calculate frequency
        const freq: Record<number, number> = {};
        recent50.forEach(d => {
            d.numbers.forEach((n: number) => {
                freq[n] = (freq[n] || 0) + 1;
            });
        });

        // STEP 3: Adjust to 25 (EXACTLY like StdDev)
        if (result.length > 25) {
            result = result
                .map(num => ({ num, freq: freq[num] || 0 }))
                .sort((a, b) => b.freq - a.freq)
                .slice(0, 25)
                .map(item => item.num);
        }
        else if (result.length < 25) {
            const allNumbers = Array.from({ length: 50 }, (_, i) => i + 1);
            const sortedByFreq = allNumbers
                .map(num => ({ num, freq: freq[num] || 0 }))
                .sort((a, b) => b.freq - a.freq);

            for (const item of sortedByFreq) {
                if (result.length >= 25) break;
                if (!result.includes(item.num)) {
                    result.push(item.num);
                }
            }
        }

        const actual = parsedDraws[i].numbers;
        const hit = actual.filter(n => result.includes(n)).length;

        hits += hit;
        totalTests++;
    }

    const accuracy = (hits / (totalTests * 5)) * 100;

    console.log('='.repeat(70));
    console.log('📊 RESULTADO: Implementação EXATA do Standard Deviation');
    console.log('='.repeat(70));
    console.log(`Total testes: ${totalTests}`);
    console.log(`Números usados: 25 (fixo)`);
    console.log(`Total hits: ${hits}/${totalTests * 5}`);
    console.log(`Acerto: ${accuracy.toFixed(1)}%`);

    console.log(`\n💡 COMPARAÇÃO:`);
    console.log(`   Standard Deviation (original): 54.2%`);
    console.log(`   Nossa implementação: ${accuracy.toFixed(1)}%`);

    if (Math.abs(accuracy - 54.2) < 0.5) {
        console.log(`\n   ✅ PERFEITO! Replicámos o algoritmo com sucesso!`);
    } else if (accuracy > 54.2) {
        console.log(`\n   🏆 MELHOR que o original! (+${(accuracy - 54.2).toFixed(1)}%)`);
    } else {
        console.log(`\n   ⚠️ Pequena diferença: ${(54.2 - accuracy).toFixed(1)}% abaixo`);
        console.log(`   (Pode ser variação nos últimos 100 sorteios)`);
    }
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
