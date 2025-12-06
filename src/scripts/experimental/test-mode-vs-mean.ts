import { prisma } from '../../lib/prisma';

async function main() {
    console.log('🧪 TESTE: Moda ±2 vs Média ±2\n');

    const allDraws = await prisma.draw.findMany({
        orderBy: { date: 'asc' }
    });

    const parsedDraws = allDraws.map(d => JSON.parse(d.numbers) as number[]);

    let modaHits = 0;
    let meanHits = 0;
    let totalTests = 0;

    const testStart = Math.max(100, parsedDraws.length - 100);

    for (let i = testStart; i < parsedDraws.length; i++) {
        const history = parsedDraws.slice(0, i);
        if (history.length < 50) continue;

        const recent50 = history.slice(-50);

        // MEAN-BASED
        const meanNumbers = new Set<number>();

        for (let pos = 0; pos < 5; pos++) {
            const values = recent50.map(d => d[pos]);
            const mean = values.reduce((a, b) => a + b, 0) / values.length;

            for (let offset = -2; offset <= 2; offset++) {
                const num = Math.round(mean) + offset;
                if (num >= 1 && num <= 50) meanNumbers.add(num);
            }
        }

        // MODE-BASED (Moda)
        const modaNumbers = new Set<number>();

        for (let pos = 0; pos < 5; pos++) {
            const values = recent50.map(d => d[pos]);

            // Calculate frequency
            const freq: Record<number, number> = {};
            values.forEach(v => {
                freq[v] = (freq[v] || 0) + 1;
            });

            // Find mode (most frequent value)
            let mode = values[0];
            let maxFreq = 0;

            for (const [num, count] of Object.entries(freq)) {
                if (count > maxFreq) {
                    maxFreq = count;
                    mode = parseInt(num);
                }
            }

            // Add mode ±2
            for (let offset = -2; offset <= 2; offset++) {
                const num = mode + offset;
                if (num >= 1 && num <= 50) modaNumbers.add(num);
            }
        }

        const actual = parsedDraws[i];

        meanHits += actual.filter(n => Array.from(meanNumbers).includes(n)).length;
        modaHits += actual.filter(n => Array.from(modaNumbers).includes(n)).length;
        totalTests++;
    }

    const meanAcc = (meanHits / (totalTests * 5)) * 100;
    const modaAcc = (modaHits / (totalTests * 5)) * 100;

    console.log('='.repeat(70));
    console.log('📊 COMPARAÇÃO');
    console.log('='.repeat(70));
    console.log(`\n📐 MÉDIA ±2:`);
    console.log(`   Hits: ${meanHits}/${totalTests * 5}`);
    console.log(`   Acerto: ${meanAcc.toFixed(1)}%`);

    console.log(`\n🎯 MODA ±2:`);
    console.log(`   Hits: ${modaHits}/${totalTests * 5}`);
    console.log(`   Acerto: ${modaAcc.toFixed(1)}%`);

    console.log(`\n💡 Conclusão:`);
    const diff = modaAcc - meanAcc;

    if (Math.abs(diff) < 0.5) {
        console.log(`   ≈ São praticamente iguais`);
    } else if (diff > 0) {
        console.log(`   🏆 MODA É MELHOR! (+${diff.toFixed(1)}%)`);
        console.log(`   → Usar o valor que SAI MAIS é superior à média aritmética`);
    } else {
        console.log(`   📐 Média é melhor (+${Math.abs(diff).toFixed(1)}%)`);
    }

    // Show example of difference
    console.log(`\n📋 Exemplo da diferença (último sorteio):`);
    const recent50 = parsedDraws.slice(-50);

    for (let pos = 0; pos < 5; pos++) {
        const values = recent50.map(d => d[pos]);
        const mean = values.reduce((a, b) => a + b, 0) / values.length;

        const freq: Record<number, number> = {};
        values.forEach(v => freq[v] = (freq[v] || 0) + 1);

        let mode = values[0];
        let maxFreq = 0;
        for (const [num, count] of Object.entries(freq)) {
            if (count > maxFreq) {
                maxFreq = count;
                mode = parseInt(num);
            }
        }

        console.log(`   Casa ${pos + 1}: Média=${mean.toFixed(1)} | Moda=${mode} (apareceu ${maxFreq}x)`);
    }
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
