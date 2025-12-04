import { prisma } from '../lib/prisma';

async function main() {
    console.log('🎯 HIGH CONFIDENCE SYSTEM: Elastic + Markov Agreement\n');

    const allDraws = await prisma.draw.findMany({
        orderBy: { date: 'asc' }
    });

    const parsedDraws = allDraws.map(d => ({
        date: d.date,
        numbers: JSON.parse(d.numbers) as number[]
    }));

    let totalHits = 0;
    let totalTests = 0;
    let totalNumbersUsed = 0;
    let casesWithHighConfidence = 0;
    const hitDistribution: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    const testStart = Math.max(100, parsedDraws.length - 100);

    console.log(`Testing ${parsedDraws.length - testStart} draws`);
    console.log('='.repeat(70));

    for (let i = testStart; i < parsedDraws.length; i++) {
        const history = parsedDraws.slice(0, i);
        if (history.length < 50) continue;

        const recent50 = history.slice(-50);
        const lastDraw = history[history.length - 1].numbers;
        const actualDraw = parsedDraws[i].numbers;

        const finalNumbers = new Set<number>();

        for (let pos = 0; pos < 5; pos++) {
            // ELASTIC
            const mean = recent50.reduce((sum, d) => sum + d.numbers[pos], 0) / 50;
            const lastVal = lastDraw[pos];

            let elasticDir: 'UP' | 'DOWN' | 'NEUTRAL' = 'NEUTRAL';
            if (lastVal < mean) elasticDir = 'UP';
            else if (lastVal > mean) elasticDir = 'DOWN';

            // MARKOV
            const transitions: Record<number, number[]> = {};

            for (let j = 0; j < history.length - 1; j++) {
                const from = history[j].numbers[pos];
                const to = history[j + 1].numbers[pos];

                if (!transitions[from]) transitions[from] = [];
                transitions[from].push(to);
            }

            let markovDir: 'UP' | 'DOWN' | 'NEUTRAL' = 'NEUTRAL';
            if (transitions[lastVal]) {
                const nexts = transitions[lastVal];
                const ups = nexts.filter(n => n > lastVal).length;
                const downs = nexts.filter(n => n < lastVal).length;
                const total = nexts.length;

                if (total > 0) {
                    const upProb = ups / total;
                    const downProb = downs / total;

                    if (upProb > downProb && upProb > 0.4) markovDir = 'UP';
                    else if (downProb > upProb && downProb > 0.4) markovDir = 'DOWN';
                }
            }

            // ONLY PROCEED IF BOTH AGREE
            if (elasticDir !== 'NEUTRAL' && elasticDir === markovDir) {
                casesWithHighConfidence++;

                // Get top 5 most frequent transitions that respect the direction
                if (transitions[lastVal]) {
                    const freq: Record<number, number> = {};

                    transitions[lastVal].forEach(n => {
                        // Filter by direction
                        if (elasticDir === 'UP' && n >= lastVal) {
                            freq[n] = (freq[n] || 0) + 1;
                        } else if (elasticDir === 'DOWN' && n <= lastVal) {
                            freq[n] = (freq[n] || 0) + 1;
                        }
                    });

                    const top5 = Object.entries(freq)
                        .sort(([, a], [, b]) => b - a)
                        .slice(0, 5)
                        .map(([num]) => parseInt(num));

                    top5.forEach(n => finalNumbers.add(n));
                }
            }
        }

        const finalArray = Array.from(finalNumbers);
        totalNumbersUsed += finalArray.length;

        const actual = actualDraw;
        const hits = actual.filter(n => finalArray.includes(n)).length;

        totalHits += hits;
        totalTests++;
        hitDistribution[hits]++;

        if (totalTests <= 10 || totalTests % 20 === 0) {
            console.log(`Draw ${i}: ${parsedDraws[i].date.toISOString().split('T')[0]} | ${finalArray.length} nums | Hits: ${hits}/5`);
        }
    }

    const avgNumbers = totalNumbersUsed / totalTests;
    const accuracy = (totalHits / (totalTests * 5)) * 100;
    const highConfPct = (casesWithHighConfidence / (totalTests * 5)) * 100;

    console.log('\n' + '='.repeat(70));
    console.log('📊 HIGH CONFIDENCE SYSTEM RESULTS');
    console.log('='.repeat(70));
    console.log(`Total tests: ${totalTests}`);
    console.log(`Positions with high confidence: ${casesWithHighConfidence}/${totalTests * 5} (${highConfPct.toFixed(1)}%)`);
    console.log(`Average numbers used: ${avgNumbers.toFixed(1)}`);
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

    console.log(`\n💡 Verdict:`);
    console.log(`   Using only ${avgNumbers.toFixed(0)} numbers (vs 25-50)`);
    console.log(`   Accuracy: ${accuracy.toFixed(1)}%`);

    if (accuracy >= 50) {
        console.log(`   ✅ Matches random baseline, but with ${((1 - avgNumbers / 25) * 100).toFixed(0)}% fewer numbers`);
    } else {
        console.log(`   ❌ Below baseline (${(50 - accuracy).toFixed(1)}% worse)`);
    }
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
