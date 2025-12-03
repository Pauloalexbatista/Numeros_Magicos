import { prisma } from '../lib/prisma';

async function main() {
    console.log('🎯 TESTING BINARY DIRECTION (with >= and <=)\n');

    const allDraws = await prisma.draw.findMany({
        orderBy: { date: 'asc' }
    });

    const parsedDraws = allDraws.map(d => ({
        date: d.date,
        numbers: JSON.parse(d.numbers) as number[]
    }));

    const results: Record<number, { correct: number, total: number }> = {
        0: { correct: 0, total: 0 },
        1: { correct: 0, total: 0 },
        2: { correct: 0, total: 0 },
        3: { correct: 0, total: 0 },
        4: { correct: 0, total: 0 }
    };

    let totalCorrect = 0;
    let totalTests = 0;

    // Test on last 100 draws
    const testStart = Math.max(100, parsedDraws.length - 100);

    console.log(`Testing ${parsedDraws.length - testStart} draws`);
    console.log('='.repeat(70));

    for (let i = testStart; i < parsedDraws.length; i++) {
        const history = parsedDraws.slice(Math.max(0, i - 50), i);
        if (history.length < 50) continue;

        const lastDraw = history[history.length - 1].numbers;
        const actualDraw = parsedDraws[i].numbers;

        let correctPositions = 0;

        for (let pos = 0; pos < 5; pos++) {
            // Calculate mean
            const mean = history.reduce((sum, d) => sum + d.numbers[pos], 0) / history.length;
            const lastVal = lastDraw[pos];
            const actualVal = actualDraw[pos];

            let predicted = false;
            let actual = false;

            // Prediction (with >= and <=)
            if (lastVal < mean) {
                // Predict: UP (>= lastVal)
                predicted = true; // UP
                actual = actualVal >= lastVal;
            } else if (lastVal > mean) {
                // Predict: DOWN (<= lastVal)
                predicted = true; // DOWN
                actual = actualVal <= lastVal;
            } else {
                // lastVal === mean → no clear prediction
                // Let's say we predict "stays close" (within ±1)
                actual = Math.abs(actualVal - lastVal) <= 1;
            }

            if (actual) {
                correctPositions++;
                results[pos].correct++;
            }
            results[pos].total++;
        }

        totalCorrect += correctPositions;
        totalTests += 5;

        if ((i - testStart) < 10 || (i - testStart) % 20 === 0) {
            console.log(`Draw ${i}: ${parsedDraws[i].date.toISOString().split('T')[0]} | Correct directions: ${correctPositions}/5`);
        }
    }

    console.log('\n' + '='.repeat(70));
    console.log('📊 DIRECTION ACCURACY RESULTS');
    console.log('='.repeat(70));

    for (let pos = 0; pos < 5; pos++) {
        const acc = (results[pos].correct / results[pos].total) * 100;
        console.log(`Position ${pos + 1}: ${results[pos].correct}/${results[pos].total} = ${acc.toFixed(1)}%`);
    }

    const overallAcc = (totalCorrect / totalTests) * 100;
    console.log(`\n🎯 OVERALL: ${totalCorrect}/${totalTests} = ${overallAcc.toFixed(1)}%`);
    console.log(`\n💡 Baseline:`);
    console.log(`   Random guess (50/50): 50%`);
    console.log(`   This system: ${overallAcc.toFixed(1)}%`);

    if (overallAcc > 50) {
        console.log(`   ✅ System is ${(overallAcc - 50).toFixed(1)}% better than random!`);
    } else {
        console.log(`   ⚠️ System is ${(50 - overallAcc).toFixed(1)}% worse than random.`);
    }
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
