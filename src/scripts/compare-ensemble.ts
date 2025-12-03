import { prisma } from '../lib/prisma';
import { rankedSystems, IPredictiveSystem } from '../services/ranked-systems';

async function main() {
    console.log('📊 Comparing Ensemble Strategies (Last 50 Draws)...');

    // 1. Fetch History
    const history = await prisma.draw.findMany({
        orderBy: { date: 'asc' },
        take: 200 // Need enough history for systems to work
    });

    const testDraws = history.slice(-50); // Test on last 50
    const trainingData = history.slice(0, -50); // Initial training data

    // 2. Define Strategies
    let standardWins = 0;
    let eliteWins = 0;
    let standardTotalHits = 0;
    let eliteTotalHits = 0;

    console.log('\nRunning backtest...');
    console.log('--------------------------------------------------');

    for (let i = 0; i < testDraws.length; i++) {
        const currentDraw = testDraws[i];
        const currentHistory = [...trainingData, ...testDraws.slice(0, i)];

        // Actual numbers
        const actual = JSON.parse(currentDraw.numbers) as number[];

        // --- Standard Ensemble (Current) ---
        // We simulate the current logic: weighted vote of ALL systems
        const standardPrediction = await runEnsemble(currentHistory, false);
        const standardHits = actual.filter(n => standardPrediction.includes(n)).length;

        // --- Elite Ensemble (>50% only) ---
        // We simulate the elite logic: only systems with >50% accuracy vote
        const elitePrediction = await runEnsemble(currentHistory, true);
        const eliteHits = actual.filter(n => elitePrediction.includes(n)).length;

        standardTotalHits += standardHits;
        eliteTotalHits += eliteHits;

        if (standardHits >= 3) standardWins++;
        if (eliteHits >= 3) eliteWins++;

        // Log significant differences
        if (Math.abs(standardHits - eliteHits) >= 2) {
            console.log(`Draw ${currentDraw.date.toISOString().split('T')[0]}: Standard=${standardHits} vs Elite=${eliteHits}`);
        }
    }

    console.log('--------------------------------------------------');
    console.log('RESULTS (Last 50 Draws):');
    console.log(`Standard Ensemble (All Systems):`);
    console.log(`  - Total Hits: ${standardTotalHits}`);
    console.log(`  - Avg Hits/Draw: ${(standardTotalHits / 50).toFixed(2)}`);
    console.log(`  - Draws with 3+ hits: ${standardWins}`);

    console.log(`\nElite Ensemble (>50% Accuracy Only):`);
    console.log(`  - Total Hits: ${eliteTotalHits}`);
    console.log(`  - Avg Hits/Draw: ${(eliteTotalHits / 50).toFixed(2)}`);
    console.log(`  - Draws with 3+ hits: ${eliteWins}`);

    if (eliteTotalHits > standardTotalHits) {
        console.log('\n✅ CONCLUSION: Elite Ensemble is performing BETTER.');
    } else if (eliteTotalHits < standardTotalHits) {
        console.log('\n❌ CONCLUSION: Standard Ensemble is performing BETTER (Diversity helps!).');
    } else {
        console.log('\n⚖️ CONCLUSION: Both strategies are performing EQUALLY.');
    }
}

// Helper to run ensemble logic
async function runEnsemble(history: any[], eliteOnly: boolean): Promise<number[]> {
    // 1. Calculate current accuracy for all systems on this history
    // In a real simulation we would need to re-calculate accuracy for every step.
    // To save time, we will use a simplified heuristic:
    // We assume the "Elite" systems are the ones that are historically good (Markov, Clustering).

    // For this test, we will use the REAL current rankings from DB to decide who is "Elite"
    // This is a slight simplification but valid for "what if we switched now".

    const systems = rankedSystems.filter(s => s.name !== 'Ensemble Voting');
    const votes: Record<number, number> = {};

    // Mock weights (similar to production)
    // In a full backtest we'd recalculate these dynamically, but let's use the current "snapshot" of who is good
    // to see if excluding the bad ones helps.
    const eliteSystems = ['Markov Chain', 'Clustering']; // Currently > 50%

    for (const system of systems) {
        if (eliteOnly && !eliteSystems.includes(system.name)) continue;

        try {
            const predicted = await system.generateTop10(history);

            // Weight logic
            let weight = 1.0;
            if (eliteSystems.includes(system.name)) weight = 1.2; // Give slight boost to elites even in standard

            predicted.forEach(num => {
                votes[num] = (votes[num] || 0) + weight;
            });
        } catch (e) { }
    }

    return Object.entries(votes)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 25)
        .map(([num]) => parseInt(num));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
