import { prisma } from '../lib/prisma';

async function main() {
    const LIMIT = 100;
    console.log(`📉 Testing Mean Reversion (Regressão à Média) - Last ${LIMIT} Draws...`);

    const draws = await prisma.draw.findMany({
        orderBy: { date: 'asc' }, // Oldest to Newest to simulate flow
        take: LIMIT
    });

    let success = 0;
    let total = 0;
    let upCount = 0;
    let downCount = 0;

    // Calculate global average first (or moving average? Let's use global for simplicity as user did)
    // Actually, user used the average of the last 50 (8.78). Let's calculate the average of this dataset.

    const values: number[] = [];
    for (const draw of draws) {
        try {
            const numbers = JSON.parse(draw.numbers);
            if (Array.isArray(numbers) && numbers.length >= 1) values.push(numbers[0]);
        } catch (e) { }
    }

    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    console.log(`   📐 Average of dataset: ${avg.toFixed(2)}`);

    console.log('\nTesting Rule:');
    console.log('   If Value < Average -> Expect Next > Value (UP)');
    console.log('   If Value > Average -> Expect Next < Value (DOWN)');

    for (let i = 0; i < values.length - 1; i++) {
        const current = values[i];
        const next = values[i + 1];

        let predictedDirection = '';

        if (current < avg) predictedDirection = 'UP';
        else if (current > avg) predictedDirection = 'DOWN';
        else continue; // Exactly on average (rare)

        let actualDirection = '';
        if (next > current) actualDirection = 'UP';
        else if (next < current) actualDirection = 'DOWN';
        else actualDirection = 'SAME';

        if (predictedDirection === actualDirection) {
            success++;
        }

        total++;

        // Stats for "Below Average" specifically
        if (current < avg) {
            if (actualDirection === 'UP') upCount++;
        }
        // Stats for "Above Average" specifically
        if (current > avg) {
            if (actualDirection === 'DOWN') downCount++;
        }
    }

    const successRate = (success / total) * 100;

    console.log(`\n📊 Results:`);
    console.log(`   Total Transitions: ${total}`);
    console.log(`   ✅ Correct Predictions: ${success}`);
    console.log(`   🎯 Success Rate: ${successRate.toFixed(1)}%`);

    console.log(`\n🔍 Detailed Breakdown:`);

    const belowAvgTotal = values.filter(v => v < avg).length; // Approx
    // Actually we need to count transitions from below avg
    const transitionsFromBelow = values.slice(0, -1).filter(v => v < avg).length;
    const transitionsFromAbove = values.slice(0, -1).filter(v => v > avg).length;

    console.log(`   📉 When Below Average (${transitionsFromBelow} times):`);
    console.log(`      Went UP: ${upCount} times (${((upCount / transitionsFromBelow) * 100).toFixed(1)}%)`);

    console.log(`   📈 When Above Average (${transitionsFromAbove} times):`);
    console.log(`      Went DOWN: ${downCount} times (${((downCount / transitionsFromAbove) * 100).toFixed(1)}%)`);

    // Last value context
    const lastValue = values[values.length - 1];
    console.log(`\n🔮 Current Context:`);
    console.log(`   Last Value: ${lastValue}`);
    console.log(`   Average: ${avg.toFixed(2)}`);
    console.log(`   Status: ${lastValue < avg ? 'BELOW Average' : 'ABOVE Average'}`);
    console.log(`   Prediction based on stats: ${lastValue < avg ? 'GO UP' : 'GO DOWN'}`);
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
