
import { prisma } from '../lib/prisma';
import { rankedSystems } from '../services/ranked-systems';
import { Draw } from '@prisma/client';

async function main() {
    console.log('🧪 Simulating "Gold Elastic" Strategy (Last 100 Draws)...');

    // 1. Identify Top 3 Systems (Gold Components)
    const rankings = await prisma.systemRanking.findMany({
        orderBy: { avgAccuracy: 'desc' },
        take: 3
    });

    if (rankings.length < 3) {
        console.error('❌ Not enough ranked systems to simulate Gold.');
        return;
    }

    console.log('🏆 Top 3 Systems:', rankings.map(r => r.systemName).join(', '));

    const top3Systems = rankedSystems.filter(s => rankings.some(r => r.systemName === s.name));

    // 2. Load History
    const history = await prisma.draw.findMany({
        orderBy: { date: 'asc' } // Oldest first for history building
    });

    // We test on the LAST 100 draws
    const testSet = history.slice(-100);

    let totalAccuracy = 0;
    let totalHits = 0;

    console.log(`\n📊 Processing ${testSet.length} draws...`);

    for (let i = 0; i < testSet.length; i++) {
        const targetDraw = testSet[i];
        // History available at that moment (all draws BEFORE target)
        const currentHistory = history.filter(d => d.date < targetDraw.date);

        if (currentHistory.length < 50) continue; // Need history for Elastic

        // --- A. GOLD LOGIC (Votes) ---
        const votes: Record<number, number> = {};

        for (const system of top3Systems) {
            // Simple weight based on rank (or accuracy)
            // Using accuracy from DB
            const rank = rankings.find(r => r.systemName === system.name);
            const weight = (rank?.avgAccuracy || 50) / 50;

            const prediction = await system.generateTop10(currentHistory);

            prediction.forEach(num => {
                votes[num] = (votes[num] || 0) + weight;
            });
        }

        // --- B. ELASTIC LOGIC (Multipliers) ---
        // Calculate Means for last 50 draws
        const recentHistory = currentHistory.slice(-50);
        const parsedRecent = recentHistory.map(d => JSON.parse(d.numbers as string) as number[]);

        const means = [0, 0, 0, 0, 0];
        for (let pos = 0; pos < 5; pos++) {
            const sum = parsedRecent.reduce((acc, nums) => acc + nums[pos], 0);
            means[pos] = sum / parsedRecent.length;
        }

        const lastDrawNums = parsedRecent[parsedRecent.length - 1]; // The very last draw before target

        // Calculate Elastic Pressures for each number 1-50
        // We don't know which "position" a number will fall into, 
        // but we can apply a general "Pressure" if the number is "due".
        // Simplified Elastic: 
        // If Pos 1 mean is 5, and last was 2 (Low), we expect Higher numbers.
        // So we boost numbers > 2.

        const elasticMultipliers: Record<number, number> = {};

        // Initialize with 1.0
        for (let n = 1; n <= 50; n++) elasticMultipliers[n] = 1.0;

        for (let pos = 0; pos < 5; pos++) {
            const val = lastDrawNums[pos];
            const mean = means[pos];

            if (val < mean) {
                // Pressure UP: Boost numbers > val
                // We apply a small boost to ALL numbers > val, 
                // but weighted by how close they are to the "expected" mean?
                // Let's keep it simple: Boost numbers in the "gap" between val and mean + margin
                for (let n = val + 1; n <= 50; n++) {
                    elasticMultipliers[n] += 0.1; // 10% boost
                }
            } else {
                // Pressure DOWN: Boost numbers < val
                for (let n = 1; n < val; n++) {
                    elasticMultipliers[n] += 0.1;
                }
            }
        }

        // --- C. COMBINE ---
        const finalScores: Record<number, number> = {};

        // Only consider numbers that received votes (Gold candidates)
        // OR consider all? Gold usually filters heavily. 
        // Let's apply Elastic to the Gold Candidates.

        Object.keys(votes).forEach(nStr => {
            const n = parseInt(nStr);
            const baseScore = votes[n];
            const multiplier = elasticMultipliers[n] || 1.0;

            finalScores[n] = baseScore * multiplier;
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
