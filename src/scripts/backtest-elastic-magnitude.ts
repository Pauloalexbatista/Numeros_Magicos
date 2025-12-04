import { prisma } from '../lib/prisma';

async function main() {
    console.log('🧪 TESTING ELASTIC MAGNITUDE SYSTEM\n');

    const allDraws = await prisma.draw.findMany({
        orderBy: { date: 'asc' }
    });

    const parsedDraws = allDraws.map(d => ({
        id: d.id,
        date: d.date,
        numbers: JSON.parse(d.numbers) as number[]
    }));

    let totalHits = 0;
    let totalTests = 0;
    const hitDistribution: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    // Test on last 100 draws
    const testStart = Math.max(0, parsedDraws.length - 100);

    console.log('Testing from draw', testStart, 'to', parsedDraws.length - 1);
    console.log('='.repeat(70));

    for (let i = testStart; i < parsedDraws.length; i++) {
        // Need at least 100 draws of history
        if (i < 100) continue;

        const targetDraw = parsedDraws[i];
        const history = parsedDraws.slice(0, i); // All draws before this one

        // Calculate magnitudes from history
        const magnitudes: { pos: number, avgUp: number, avgDown: number }[] = [];

        for (let pos = 0; pos < 5; pos++) {
            const upShifts: number[] = [];
            const downShifts: number[] = [];

            // Analyze each historical transition
            for (let j = 50; j < history.length - 1; j++) {
                const current = history[j].numbers;
                const next = history[j + 1].numbers;

                // Mean from previous 50
                const window = history.slice(j - 50, j);
                const mean = window.reduce((sum, d) => sum + d.numbers[pos], 0) / 50;

                const diff = current[pos] - mean;

                if (diff < 0) {
                    upShifts.push(next[pos] - current[pos]);
                } else if (diff > 0) {
                    downShifts.push(next[pos] - current[pos]);
                }
            }

            const avgUp = upShifts.length > 0
                ? upShifts.reduce((a, b) => a + b, 0) / upShifts.length
                : 0;

            const avgDown = downShifts.length > 0
                ? downShifts.reduce((a, b) => a + b, 0) / downShifts.length
                : 0;

            magnitudes.push({ pos, avgUp, avgDown });
        }

        // Generate prediction for target draw
        const lastDraw = history[history.length - 1].numbers;
        const recentHistory = history.slice(-50);
        const means = [0, 0, 0, 0, 0].map((_, pos) =>
            recentHistory.reduce((sum, d) => sum + d.numbers[pos], 0) / 50
        );

        const prediction: number[] = [];

        for (let pos = 0; pos < 5; pos++) {
            const lastVal = lastDraw[pos];
            const mean = means[pos];
            const mag = magnitudes[pos];

            let expectedShift = 0;
            if (lastVal < mean) {
                expectedShift = mag.avgUp;
            } else {
                expectedShift = mag.avgDown;
            }

            const center = Math.round(lastVal + expectedShift);

            // Pick 5 numbers around the center
            const candidates = [
                center - 2,
                center - 1,
                center,
                center + 1,
                center + 2
            ].filter(n => n >= 1 && n <= 50);

            prediction.push(...candidates);
        }

        // Deduplicate and ensure we have 25
        const unique = [...new Set(prediction)];

        // If we have more than 25, trim; if less, fill with hot numbers
        let final25 = unique.slice(0, 25);

        if (final25.length < 25) {
            // Fill with numbers 1-50 not yet included
            for (let n = 1; n <= 50 && final25.length < 25; n++) {
                if (!final25.includes(n)) {
                    final25.push(n);
                }
            }
        }

        // Compare with actual
        const actual = targetDraw.numbers;
        const hits = actual.filter(n => final25.includes(n)).length;

        totalHits += hits;
        totalTests++;
        hitDistribution[hits]++;

        if (totalTests <= 10 || totalTests % 20 === 0) {
            console.log(`Draw ${i}: ${targetDraw.date.toISOString().split('T')[0]} | Hits: ${hits}/5`);
        }
    }

    console.log('\n' + '='.repeat(70));
    console.log('📊 RESULTS');
    console.log('='.repeat(70));
    console.log(`Total tests: ${totalTests}`);
    console.log(`Total hits: ${totalHits}`);
    console.log(`Average hits per draw: ${(totalHits / totalTests).toFixed(2)}`);
    console.log(`Accuracy: ${((totalHits / (totalTests * 5)) * 100).toFixed(1)}%`);
    console.log(`\nHit Distribution:`);
    for (let i = 0; i <= 5; i++) {
        const count = hitDistribution[i];
        const pct = ((count / totalTests) * 100).toFixed(1);
        const bar = '█'.repeat(Math.round(count / totalTests * 50));
        console.log(`  ${i} hits: ${count.toString().padStart(3)} (${pct.padStart(5)}%) ${bar}`);
    }

    console.log(`\n💡 Baseline Comparison:`);
    console.log(`  Random (50% of numbers): ~50% accuracy`);
    console.log(`  This system: ${((totalHits / (totalTests * 5)) * 100).toFixed(1)}%`);
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
