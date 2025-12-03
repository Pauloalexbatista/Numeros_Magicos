import { prisma } from '../lib/prisma';

async function main() {
    console.log('🎯 TESTE: Média ±3 + Pontuação por Distância\n');

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

        // Calculate score for each number
        const numberScores: Record<number, number> = {};

        for (let pos = 0; pos < 5; pos++) {
            const values = recent50.map(d => d.numbers[pos]);
            const mean = values.reduce((a, b) => a + b, 0) / values.length;

            // Generate candidates ±3
            for (let offset = -3; offset <= 3; offset++) {
                const num = Math.round(mean) + offset;
                if (num >= 1 && num <= 50) {
                    // Score based on distance from mean
                    // Closer to mean = higher score
                    // Distance 0 = 7 points, distance 1 = 6 points, ..., distance 3 = 4 points
                    const distance = Math.abs(num - mean);
                    const score = 7 - distance;

                    // Add score (numbers can appear in multiple positions)
                    numberScores[num] = (numberScores[num] || 0) + score;
                }
            }
        }

        // Sort by score and pick top 25
        const sortedNumbers = Object.entries(numberScores)
            .map(([num, score]) => ({ num: parseInt(num), score }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 25)
            .map(item => item.num);

        const actual = parsedDraws[i].numbers;
        const hit = actual.filter(n => sortedNumbers.includes(n)).length;

        hits += hit;
        totalTests++;
    }

    const accuracy = (hits / (totalTests * 5)) * 100;

    console.log('='.repeat(70));
    console.log('📊 RESULTADO: Média ±3 + Pontuação por Distância');
    console.log('='.repeat(70));
    console.log(`Total testes: ${totalTests}`);
    console.log(`Números usados: 25 (fixo)`);
    console.log(`Total hits: ${hits}/${totalTests * 5}`);
    console.log(`Acerto: ${accuracy.toFixed(1)}%`);

    console.log(`\n💡 COMPARAÇÃO (todos com 25 números):`);
    console.log(`   Baseline: 50%`);
    console.log(`   Standard Deviation: 54.2%`);
    console.log(`   Este sistema: ${accuracy.toFixed(1)}%`);

    if (accuracy > 54.2) {
        console.log(`\n   🏆 NOVO RECORDE! (+${(accuracy - 54.2).toFixed(1)}%)`);
    } else if (accuracy > 50) {
        console.log(`\n   ✅ Melhor que baseline (+${(accuracy - 50).toFixed(1)}%)`);
    }

    // Show example for next draw
    console.log(`\n📋 Exemplo (próximo sorteio):`);
    const history = parsedDraws;
    const recent50 = history.slice(-50);

    const numberScores: Record<number, number> = {};

    for (let pos = 0; pos < 5; pos++) {
        const values = recent50.map(d => d.numbers[pos]);
        const mean = values.reduce((a, b) => a + b, 0) / values.length;

        console.log(`\nCasa ${pos + 1} (média: ${mean.toFixed(1)}):`);

        const candidates: { num: number, distance: number, score: number }[] = [];

        for (let offset = -3; offset <= 3; offset++) {
            const num = Math.round(mean) + offset;
            if (num >= 1 && num <= 50) {
                const distance = Math.abs(num - mean);
                const score = 7 - distance;
                candidates.push({ num, distance, score });

                numberScores[num] = (numberScores[num] || 0) + score;
            }
        }

        console.log(`   ${candidates.map(c => `${c.num}(${c.score}pts)`).join(', ')}`);
    }

    const top25 = Object.entries(numberScores)
        .map(([num, score]) => ({ num: parseInt(num), score }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 25);

    console.log(`\nTop 25 por pontuação total:`);
    console.log(top25.map(item => `${item.num}(${item.score}pts)`).join(', '));
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
