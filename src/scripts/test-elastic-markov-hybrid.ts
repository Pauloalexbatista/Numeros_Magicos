import { prisma } from '../lib/prisma';

async function main() {
    console.log('🎯 HYBRID DIRECTION: Elastic + Markov\n');

    const allDraws = await prisma.draw.findMany({
        orderBy: { date: 'asc' }
    });

    const parsedDraws = allDraws.map(d => ({
        date: d.date,
        numbers: JSON.parse(d.numbers) as number[]
    }));

    const results = {
        elasticOnly: { correct: 0, total: 0 },
        markovOnly: { correct: 0, total: 0 },
        bothAgree: { correct: 0, total: 0 },
        bothDisagree: { correct: 0, total: 0 },
        hybrid: { correct: 0, total: 0 }
    };

    // Test on last 100 draws
    const testStart = Math.max(100, parsedDraws.length - 100);

    console.log(`Testing ${parsedDraws.length - testStart} draws`);
    console.log('='.repeat(70));

    for (let i = testStart; i < parsedDraws.length; i++) {
        const history = parsedDraws.slice(0, i);
        if (history.length < 50) continue;

        const recent50 = history.slice(-50);
        const lastDraw = history[history.length - 1].numbers;
        const actualDraw = parsedDraws[i].numbers;

        for (let pos = 0; pos < 5; pos++) {
            // 1. ELASTIC PREDICTION
            const mean = recent50.reduce((sum, d) => sum + d.numbers[pos], 0) / 50;
            const lastVal = lastDraw[pos];
            const actualVal = actualDraw[pos];

            let elasticPrediction: 'UP' | 'DOWN' | 'NEUTRAL' = 'NEUTRAL';
            if (lastVal < mean) elasticPrediction = 'UP';
            else if (lastVal > mean) elasticPrediction = 'DOWN';

            // 2. MARKOV PREDICTION
            // Build transition matrix for this position
            const transitions: Record<number, { up: number, down: number, same: number }> = {};

            for (let j = 0; j < history.length - 1; j++) {
                const from = history[j].numbers[pos];
                const to = history[j + 1].numbers[pos];

                if (!transitions[from]) {
                    transitions[from] = { up: 0, down: 0, same: 0 };
                }

                if (to > from) transitions[from].up++;
                else if (to < from) transitions[from].down++;
                else transitions[from].same++;
            }

            let markovPrediction: 'UP' | 'DOWN' | 'NEUTRAL' = 'NEUTRAL';
            if (transitions[lastVal]) {
                const { up, down, same } = transitions[lastVal];
                const total = up + down + same;

                if (total > 0) {
                    const upProb = up / total;
                    const downProb = down / total;

                    if (upProb > downProb && upProb > 0.4) markovPrediction = 'UP';
                    else if (downProb > upProb && downProb > 0.4) markovPrediction = 'DOWN';
                }
            }

            // 3. ACTUAL RESULT
            let actualDirection: 'UP' | 'DOWN' | 'NEUTRAL' = 'NEUTRAL';
            if (actualVal > lastVal) actualDirection = 'UP';
            else if (actualVal < lastVal) actualDirection = 'DOWN';

            // 4. EVALUATE PREDICTIONS
            const elasticCorrect = (elasticPrediction === 'NEUTRAL' && actualDirection === 'NEUTRAL') ||
                (elasticPrediction === 'UP' && actualVal >= lastVal) ||
                (elasticPrediction === 'DOWN' && actualVal <= lastVal);

            const markovCorrect = (markovPrediction === 'NEUTRAL') ||
                (markovPrediction === 'UP' && actualVal > lastVal) ||
                (markovPrediction === 'DOWN' && actualVal < lastVal);

            results.elasticOnly.total++;
            if (elasticCorrect) results.elasticOnly.correct++;

            results.markovOnly.total++;
            if (markovCorrect) results.markovOnly.correct++;

            // 5. AGREEMENT ANALYSIS
            if (elasticPrediction !== 'NEUTRAL' && markovPrediction !== 'NEUTRAL') {
                if (elasticPrediction === markovPrediction) {
                    // Both agree
                    results.bothAgree.total++;
                    if (elasticCorrect) results.bothAgree.correct++;
                } else {
                    // Both disagree
                    results.bothDisagree.total++;
                    if (elasticCorrect) results.bothDisagree.correct++;
                }
            }

            // 6. HYBRID DECISION (trust agreement, fallback to elastic)
            let hybridCorrect = false;
            if (elasticPrediction !== 'NEUTRAL' && markovPrediction !== 'NEUTRAL') {
                if (elasticPrediction === markovPrediction) {
                    // Both agree → high confidence
                    hybridCorrect = elasticCorrect;
                } else {
                    // Disagree → trust elastic (it's more reliable)
                    hybridCorrect = elasticCorrect;
                }
            } else {
                // One is neutral → use the other
                hybridCorrect = elasticCorrect;
            }

            results.hybrid.total++;
            if (hybridCorrect) results.hybrid.correct++;
        }
    }

    console.log('\n' + '='.repeat(70));
    console.log('📊 ELASTIC + MARKOV HYBRID RESULTS');
    console.log('='.repeat(70));

    const elasticAcc = (results.elasticOnly.correct / results.elasticOnly.total) * 100;
    const markovAcc = (results.markovOnly.correct / results.markovOnly.total) * 100;
    const agreeAcc = results.bothAgree.total > 0
        ? (results.bothAgree.correct / results.bothAgree.total) * 100
        : 0;
    const disagreeAcc = results.bothDisagree.total > 0
        ? (results.bothDisagree.correct / results.bothDisagree.total) * 100
        : 0;
    const hybridAcc = (results.hybrid.correct / results.hybrid.total) * 100;

    console.log(`\n1️⃣ Elastic Only: ${results.elasticOnly.correct}/${results.elasticOnly.total} = ${elasticAcc.toFixed(1)}%`);
    console.log(`2️⃣ Markov Only:  ${results.markovOnly.correct}/${results.markovOnly.total} = ${markovAcc.toFixed(1)}%`);
    console.log(`\n3️⃣ When BOTH AGREE: ${results.bothAgree.correct}/${results.bothAgree.total} = ${agreeAcc.toFixed(1)}%`);
    console.log(`4️⃣ When DISAGREE:   ${results.bothDisagree.correct}/${results.bothDisagree.total} = ${disagreeAcc.toFixed(1)}%`);
    console.log(`\n🎯 HYBRID (trust agreement): ${results.hybrid.correct}/${results.hybrid.total} = ${hybridAcc.toFixed(1)}%`);

    console.log(`\n💡 Analysis:`);
    console.log(`   Baseline (random): 50%`);
    console.log(`   Elastic alone: ${elasticAcc.toFixed(1)}%`);
    console.log(`   Markov alone: ${markovAcc.toFixed(1)}%`);
    console.log(`   Hybrid: ${hybridAcc.toFixed(1)}%`);

    if (hybridAcc > elasticAcc) {
        console.log(`   ✅ Hybrid is ${(hybridAcc - elasticAcc).toFixed(1)}% better than Elastic!`);
    } else {
        console.log(`   ⚠️ Hybrid didn't improve over Elastic.`);
    }

    if (agreeAcc > 80) {
        console.log(`   🏆 When both agree: ${agreeAcc.toFixed(1)}% accuracy! (${results.bothAgree.total} cases)`);
    }
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
