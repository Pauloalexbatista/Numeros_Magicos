import { prisma } from '../lib/prisma';

async function main() {
    console.log('🎯 TESTE: Média ±3 + Ordenação por Frequência (como StdDev)\n');

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

        // STEP 1: Generate candidates with Mean ±3 per position
        const candidates = new Set<number>();

        for (let pos = 0; pos < 5; pos++) {
            const values = recent50.map(d => d.numbers[pos]);
            const mean = values.reduce((a, b) => a + b, 0) / values.length;

            for (let offset = -3; offset <= 3; offset++) {
                const num = Math.round(mean) + offset;
                if (num >= 1 && num <= 50) {
                    candidates.add(num);
                }
            }
        }

        let result = Array.from(candidates);

        // STEP 2: Calculate frequency in recent history
        const freq: Record<number, number> = {};
        recent50.forEach(d => {
            d.numbers.forEach((n: number) => {
                freq[n] = (freq[n] || 0) + 1;
            });
        });

        // STEP 3: If > 25, sort by frequency and keep top 25
        if (result.length > 25) {
            result = result
                .map(num => ({ num, freq: freq[num] || 0 }))
                .sort((a, b) => b.freq - a.freq)
                .slice(0, 25)
                .map(item => item.num);
        }
        // If < 25, fill with most frequent numbers
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
    console.log('📊 RESULTADO: Média ±3 + Freq (método StdDev)');
    console.log('='.repeat(70));
    console.log(`Total testes: ${totalTests}`);
    console.log(`Números usados: 25 (fixo)`);
    console.log(`Total hits: ${hits}/${totalTests * 5}`);
    console.log(`Acerto: ${accuracy.toFixed(1)}%`);

    console.log(`\n💡 COMPARAÇÃO FINAL (todos com 25 números):`);
    console.log(`   Baseline (aleatório): 50%`);
    console.log(`   Standard Deviation: 54.2%`);
    console.log(`   Média ±3 + Freq: ${accuracy.toFixed(1)}%`);

    if (accuracy > 54.2) {
        const improvement = accuracy - 54.2;
        console.log(`\n   🏆🏆🏆 NOVO RECORDE! (+${improvement.toFixed(1)}%)`);
        console.log(`   Melhoramos o melhor sistema existente!`);
    } else if (accuracy > 50) {
        console.log(`\n   ✅ Melhor que baseline (+${(accuracy - 50).toFixed(1)}%)`);
        if (Math.abs(accuracy - 54.2) < 1) {
            console.log(`   ≈ Praticamente igual ao StdDev`);
        } else {
            console.log(`   ⚠️ Ainda ${(54.2 - accuracy).toFixed(1)}% abaixo do StdDev`);
        }
    } else {
        console.log(`\n   ❌ Pior que baseline`);
    }
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
