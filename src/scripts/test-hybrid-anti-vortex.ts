import { prisma } from '../lib/prisma';
import { VortexPyramidSystem } from '../services/vortex-pyramid';

async function main() {
    console.log('🔬 HYBRID SYSTEM: Anti-Vortex Pyramid + Elastic Filter\n');

    const allDraws = await prisma.draw.findMany({
        orderBy: { date: 'asc' }
    });

    const parsedDraws = allDraws.map(d => ({
        date: d.date,
        numbers: JSON.parse(d.numbers) as number[]
    }));

    const vortex = new VortexPyramidSystem();

    let totalHits = 0;
    let totalTests = 0;
    let totalNumbersBase = 0;
    let totalNumbersFiltered = 0;
    const hitDistribution: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    // Test on last 100 draws
    const testStart = Math.max(100, parsedDraws.length - 100);

    console.log(`Testing ${parsedDraws.length - testStart} draws`);
    console.log('='.repeat(70));

    for (let i = testStart; i < parsedDraws.length; i++) {
        const history = parsedDraws.slice(0, i);
        if (history.length < 50) continue;

        // Convert to Draw format for Vortex
        const historyDraws = history.map(d => ({
            numbers: JSON.stringify(d.numbers)
        })) as any[];

        // 1. Get Vortex prediction
        const vortexNumbers = await vortex.generateTop10(historyDraws);

        // 2. Get ANTI-Vortex (complement)
        const allNumbers = Array.from({ length: 50 }, (_, i) => i + 1);
        const antiVortexNumbers = allNumbers.filter(n => !vortexNumbers.includes(n)).slice(0, 25);

        totalNumbersBase += antiVortexNumbers.length;

        // 3. Calculate Elastic Directions
        const recent50 = history.slice(-50);
        const lastDraw = history[history.length - 1].numbers;
        const means = [0, 0, 0, 0, 0].map((_, pos) =>
            recent50.reduce((sum, d) => sum + d.numbers[pos], 0) / 50
        );

        // 4. Filter by Position Constraints
        const validByPosition: number[][] = [[], [], [], [], []];

        for (let pos = 0; pos < 5; pos++) {
            const lastVal = lastDraw[pos];
            const mean = means[pos];

            if (lastVal < mean) {
                // UP: Accept numbers >= lastVal
                validByPosition[pos] = antiVortexNumbers.filter(n => n >= lastVal);
            } else if (lastVal > mean) {
                // DOWN: Accept numbers <= lastVal
                validByPosition[pos] = antiVortexNumbers.filter(n => n <= lastVal);
            } else {
                // Equal: Accept all
                validByPosition[pos] = [...antiVortexNumbers];
            }
        }

        // 5. Union of all valid numbers
        const finalPrediction = [...new Set(validByPosition.flat())];
        totalNumbersFiltered += finalPrediction.length;

        // 6. Test against actual
        const actual = parsedDraws[i].numbers;
        const hits = actual.filter(n => finalPrediction.includes(n)).length;

        totalHits += hits;
        totalTests++;
        hitDistribution[hits]++;

        if (totalTests <= 10 || totalTests % 20 === 0) {
            console.log(`Draw ${i}: ${parsedDraws[i].date.toISOString().split('T')[0]} | ${antiVortexNumbers.length}→${finalPrediction.length} nums | Hits: ${hits}/5`);
        }
    }

    const avgBase = totalNumbersBase / totalTests;
    const avgFiltered = totalNumbersFiltered / totalTests;
    const accuracy = (totalHits / (totalTests * 5)) * 100;
    const reduction = ((avgBase - avgFiltered) / avgBase) * 100;

    console.log('\n' + '='.repeat(70));
    console.log('📊 ANTI-VORTEX PYRAMID + ELASTIC FILTER RESULTS');
    console.log('='.repeat(70));
    console.log(`Total tests: ${totalTests}`);
    console.log(`Average base numbers: ${avgBase.toFixed(1)}`);
    console.log(`Average after filter: ${avgFiltered.toFixed(1)}`);
    console.log(`Reduction: ${reduction.toFixed(1)}%`);
    console.log(`Total hits: ${totalHits}`);
    console.log(`Average hits per draw: ${(totalHits / totalTests).toFixed(2)}`);
    console.log(`Accuracy: ${accuracy.toFixed(1)}%`);

    console.log(`\nHit Distribution:`);
    for (let i = 0; i <= 5; i++) {
        const count = hitDistribution[i];
        const pct = ((count / totalTests) * 100).toFixed(1);
        const bar = '█'.repeat(Math.round(count / totalTests * 50));
        console.log(`  ${i} hits: ${count.toString().padStart(3)} (${pct.padStart(5)}%) ${bar}`);
    }

    console.log(`\n💡 Comparison:`);
    console.log(`  Anti-Vortex alone (${avgBase.toFixed(0)} nums): ~50% baseline`);
    console.log(`  + Elastic Filter (${avgFiltered.toFixed(0)} nums): ${accuracy.toFixed(1)}%`);
    console.log(`  Reduction: ${(avgBase - avgFiltered).toFixed(1)} numbers (${reduction.toFixed(0)}% less)`);

    if (accuracy >= 50 && reduction > 5) {
        console.log(`  ✅ WINNER: Same/better accuracy with ${reduction.toFixed(0)}% fewer numbers!`);
    } else if (accuracy >= 52) {
        console.log(`  ✅ GOOD: ${(accuracy - 50).toFixed(1)}% better accuracy!`);
    }
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
