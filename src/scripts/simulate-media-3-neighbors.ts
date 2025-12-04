
import { prisma } from '../lib/prisma';
import { Draw } from '@prisma/client';

async function main() {
    console.log('🧪 Simulating "Mean + 3 Neighbors" Strategy (Last 100 Draws)...');

    // 1. Load History
    const history = await prisma.draw.findMany({
        orderBy: { date: 'asc' }
    });

    // We test on the LAST 100 draws
    const testSet = history.slice(-100);

    let totalAccuracy = 0;
    let totalHits = 0;

    let totalRawAccuracy = 0;
    let totalRawHits = 0;
    let totalCandidates = 0;

    console.log(`\n📊 Processing ${testSet.length} draws...`);

    for (let i = 0; i < testSet.length; i++) {
        const targetDraw = testSet[i];
        const currentHistory = history.filter(d => d.date < targetDraw.date);

        // Need at least 10 draws for calculation
        if (currentHistory.length < 10) continue;

        // --- STRATEGY LOGIC ---
        // 1. Parse last 10 draws
        const recentDraws = currentHistory.slice(-10).map(d => {
            if (typeof d.numbers === 'string') return JSON.parse(d.numbers) as number[];
            return d.numbers as unknown as number[];
        });

        const candidateTiers: Record<number, number> = {}; // num -> min tier (0 is best)

        // 2. Process each of the 5 positions
        for (let pos = 0; pos < 5; pos++) {
            const valuesAtPos = recentDraws.map(d => d[pos]).filter(n => !isNaN(n));
            if (valuesAtPos.length < 3) continue;

            // Trimmed Mean
            valuesAtPos.sort((a, b) => a - b);
            const trimmedValues = valuesAtPos.slice(1, -1);
            if (trimmedValues.length === 0) continue;

            const sum = trimmedValues.reduce((a, b) => a + b, 0);
            const mean = Math.round(sum / trimmedValues.length);

            // Select Mean + 3 Neighbors
            for (let offset = -3; offset <= 3; offset++) {
                const num = mean + offset;
                if (num < 1 || num > 50) continue;

                const tier = Math.abs(offset); // 0=Mean, 1=Neighbor1, etc.
                if (candidateTiers[num] === undefined || tier < candidateTiers[num]) {
                    candidateTiers[num] = tier;
                }
            }
        }

        let sortedResult = Object.keys(candidateTiers).map(n => parseInt(n));

        // Sort by Tier (ascending), then by Frequency as tie-breaker
        const frequency: Record<number, number> = {};
        recentDraws.flat().forEach(n => frequency[n] = (frequency[n] || 0) + 1);

        sortedResult.sort((a, b) => {
            const tierA = candidateTiers[a];
            const tierB = candidateTiers[b];
            if (tierA !== tierB) return tierA - tierB; // Lower tier first (closer to mean)

            // Tie-breaker: Frequency
            const freqA = frequency[a] || 0;
            const freqB = frequency[b] || 0;
            return freqB - freqA;
        });

        // --- METRIC 1: RAW ACCURACY (No Cutoff) ---
        const actual = JSON.parse(targetDraw.numbers as string) as number[];
        const rawHits = actual.filter(n => sortedResult.includes(n)).length;
        // Raw accuracy is just "Coverage" here. 
        // If we picked 35 numbers and got 5 hits, that's 100% coverage.
        const rawAccuracy = (rawHits / 5) * 100;

        totalRawHits += rawHits;
        totalRawAccuracy += rawAccuracy;
        totalCandidates += sortedResult.length;

        // --- CUTOFF TO 25 ---
        const finalPrediction = sortedResult.slice(0, 25);

        // --- METRIC 2: FINAL ACCURACY ---
        const finalHits = actual.filter(n => finalPrediction.includes(n)).length;
        const finalAccuracy = (finalHits / 5) * 100;

        totalHits += finalHits;
        totalAccuracy += finalAccuracy;

        if (i % 20 === 0) process.stdout.write('.');
    }

    const avgAccuracy = totalAccuracy / testSet.length;
    const avgRawAccuracy = totalRawAccuracy / testSet.length;
    const avgCandidates = totalCandidates / testSet.length;

    console.log('\n\n🏁 Simulation Complete');
    console.log(`🔢 Avg Candidates (Raw): ${avgCandidates.toFixed(1)}`);
    console.log(`🎯 Raw Coverage (All Candidates): ${avgRawAccuracy.toFixed(2)}%`);
    console.log(`📈 Final Accuracy (Top 25, Tier-Sorted): ${avgAccuracy.toFixed(2)}%`);

    if (avgAccuracy > 54) console.log('✅ RESULT: EXCELLENT (> 54%)');
    else if (avgAccuracy < 46) console.log('✅ RESULT: EXCELLENT INVERSE (< 46%)');
    else console.log('⚠️ RESULT: AVERAGE (46-54%)');
}

main();
