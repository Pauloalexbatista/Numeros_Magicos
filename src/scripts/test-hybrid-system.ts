import { prisma } from '../lib/prisma';

async function main() {
    console.log('🔬 HYBRID SYSTEM: Top System + Elastic Filter\n');

    const allDraws = await prisma.draw.findMany({
        orderBy: { date: 'asc' }
    });

    const parsedDraws = allDraws.map(d => ({
        date: d.date,
        numbers: JSON.parse(d.numbers) as number[]
    }));

    // Function to generate Hot Numbers prediction
    function getHotNumbers(history: typeof parsedDraws): number[] {
        const frequency: Record<number, number> = {};

        history.forEach(draw => {
            draw.numbers.forEach(num => {
                frequency[num] = (frequency[num] || 0) + 1;
            });
        });

        return Object.entries(frequency)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 25)
            .map(([num]) => parseInt(num));
    }

    let totalHits = 0;
    let totalTests = 0;
    let totalNumbersUsed = 0;
    const hitDistribution: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    // Test on last 100 draws
    const testStart = Math.max(100, parsedDraws.length - 100);

    console.log(`Testing ${parsedDraws.length - testStart} draws`);
    console.log('='.repeat(70));

    for (let i = testStart; i < parsedDraws.length; i++) {
        const history = parsedDraws.slice(0, i);
        if (history.length < 50) continue;

        // 1. Get Hot Numbers (25 numbers)
        const hotNumbers = getHotNumbers(history);

        // 2. Calculate Elastic Directions
        const recent50 = history.slice(-50);
        const lastDraw = history[history.length - 1].numbers;
        const means = [0, 0, 0, 0, 0].map((_, pos) =>
            recent50.reduce((sum, d) => sum + d.numbers[pos], 0) / 50
        );

        // 3. Filter Hot Numbers by Position Constraints
        const validByPosition: number[][] = [[], [], [], [], []];

        for (let pos = 0; pos < 5; pos++) {
            const lastVal = lastDraw[pos];
            const mean = means[pos];

            if (lastVal < mean) {
                // UP: Accept numbers >= lastVal
                validByPosition[pos] = hotNumbers.filter(n => n >= lastVal);
            } else if (lastVal > mean) {
                // DOWN: Accept numbers <= lastVal
                validByPosition[pos] = hotNumbers.filter(n => n <= lastVal);
            } else {
                // Equal: Accept all
                validByPosition[pos] = [...hotNumbers];
            }
        }

        // 4. Union of all valid numbers
        const finalPrediction = [...new Set(validByPosition.flat())];

        // 5. Test against actual
        const actual = parsedDraws[i].numbers;
        const hits = actual.filter(n => finalPrediction.includes(n)).length;

        totalHits += hits;
        totalTests++;
        totalNumbersUsed += finalPrediction.length;
        hitDistribution[hits]++;

        if (totalTests <= 10 || totalTests % 20 === 0) {
            console.log(`Draw ${i}: ${parsedDraws[i].date.toISOString().split('T')[0]} | ${finalPrediction.length} nums | Hits: ${hits}/5`);
        }
    }

    const avgNumbers = totalNumbersUsed / totalTests;
    const accuracy = (totalHits / (totalTests * 5)) * 100;

    console.log('\n' + '='.repeat(70));
    console.log('📊 HYBRID SYSTEM RESULTS');
    console.log('='.repeat(70));
    console.log(`Total tests: ${totalTests}`);
    console.log(`Average numbers used: ${avgNumbers.toFixed(1)} (vs 25 original)`);
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
    console.log(`  Hot Numbers alone (25 nums): ~50% accuracy`);
    console.log(`  This hybrid (${avgNumbers.toFixed(0)} nums): ${accuracy.toFixed(1)}%`);

    if (accuracy > 50) {
        console.log(`  ✅ ${(accuracy - 50).toFixed(1)}% better with ${(25 - avgNumbers).toFixed(0)} fewer numbers!`);
    } else {
        console.log(`  ⚠️ ${(50 - accuracy).toFixed(1)}% worse, but using ${(25 - avgNumbers).toFixed(0)} fewer numbers.`);
    }
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
