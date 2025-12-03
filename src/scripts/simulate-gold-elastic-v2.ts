
import { prisma } from '../lib/prisma';
import { rankedSystems } from '../services/ranked-systems';
import { Draw } from '@prisma/client';

async function main() {
    console.log('🧪 Simulating "Gold Elastic V2" (Stronger Logic)...');

    // 1. Identify Top 3 Systems
    const rankings = await prisma.systemRanking.findMany({
        orderBy: { avgAccuracy: 'desc' },
        take: 3
    });

    const top3Systems = rankedSystems.filter(s => rankings.some(r => r.systemName === s.name));

    // 2. Load History
    const history = await prisma.draw.findMany({
        orderBy: { date: 'asc' }
    });

    const testSet = history.slice(-100);

    let totalAccuracy = 0;
    let totalHits = 0;

    console.log(`\n📊 Processing ${testSet.length} draws...`);

    for (let i = 0; i < testSet.length; i++) {
        const targetDraw = testSet[i];
        const currentHistory = history.filter(d => d.date < targetDraw.date);

        if (currentHistory.length < 50) continue;

        // --- A. GOLD VOTES ---
        const votes: Record<number, number> = {};
        for (const system of top3Systems) {
            const rank = rankings.find(r => r.systemName === system.name);
            const weight = (rank?.avgAccuracy || 50) / 50;
            const prediction = await system.generateTop10(currentHistory);
            prediction.forEach(num => votes[num] = (votes[num] || 0) + weight);
        }

        // --- B. ELASTIC / MEAN LOGIC (The "Secret Sauce") ---
        // Calculate Means for last 10 draws (like in Mean+3)
        const recentDraws = currentHistory.slice(-10).map(d => {
            if (typeof d.numbers === 'string') return JSON.parse(d.numbers) as number[];
            return d.numbers as unknown as number[];
        });

        // Calculate "Ideal Numbers" based on Means
        const idealNumbers = new Set<number>();
        for (let pos = 0; pos < 5; pos++) {
            const valuesAtPos = recentDraws.map(d => d[pos]).filter(n => !isNaN(n));
            if (valuesAtPos.length < 3) continue;
            valuesAtPos.sort((a, b) => a - b);
            const trimmedValues = valuesAtPos.slice(1, -1);
            if (trimmedValues.length === 0) continue;
            const sum = trimmedValues.reduce((a, b) => a + b, 0);
            const mean = Math.round(sum / trimmedValues.length);

            // The "Ideal" zone is Mean +/- 3
            for (let offset = -3; offset <= 3; offset++) {
                idealNumbers.add(mean + offset);
            }
        }

        // --- C. COMBINE ---
        // We boost numbers that are in the "Ideal Zone"
        const finalScores: Record<number, number> = {};

        Object.keys(votes).forEach(nStr => {
            const n = parseInt(nStr);
            let score = votes[n];

            // ELASTIC BOOST:
            // If the number is in the "Ideal Zone" (Mean +/- 3), it gets a massive boost.
            // This filters the Gold candidates to those that make statistical sense.
            if (idealNumbers.has(n)) {
                score *= 1.5; // 50% Boost
            } else {
                score *= 0.8; // Penalty for being "far from mean"
            }

            finalScores[n] = score;
        });

        // Select Top 25
        const predicted = Object.entries(finalScores)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 25)
            .map(([n]) => parseInt(n));

        // --- D. VERIFY ---
        const actual = JSON.parse(targetDraw.numbers as string) as number[];
        const hits = actual.filter(n => predicted.includes(n)).length;
        const accuracy = (hits / 5) * 100;

        totalHits += hits;
        totalAccuracy += accuracy;

        if (i % 20 === 0) process.stdout.write('.');
    }

    const avgAccuracy = totalAccuracy / testSet.length;
    console.log('\n\n🏁 Simulation Complete');
    console.log(`📈 Average Accuracy: ${avgAccuracy.toFixed(2)}%`);

    if (avgAccuracy > 54) console.log('✅ RESULT: EXCELLENT (> 54%)');
    else if (avgAccuracy < 46) console.log('✅ RESULT: EXCELLENT INVERSE (< 46%)');
    else console.log('⚠️ RESULT: AVERAGE (46-54%)');
}

main();
