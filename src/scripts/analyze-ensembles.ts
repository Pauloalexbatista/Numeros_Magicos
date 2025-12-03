
import { prisma } from '../lib/prisma';
import { rankedSystems } from '../services/ranked-systems';
import { Draw } from '@prisma/client';

async function main() {
    console.log('🧪 Analyzing Ensemble Systems (Gold, Silver, Bronze) - Last 100 Draws...');

    // 1. Load History
    const history = await prisma.draw.findMany({
        orderBy: { date: 'asc' }
    });

    const testSet = history.slice(-100);

    // Stats containers
    const stats = {
        Gold: { hits: 0, rawHits: 0, candidates: 0, accuracy: 0, rawAccuracy: 0 },
        Silver: { hits: 0, rawHits: 0, candidates: 0, accuracy: 0, rawAccuracy: 0 },
        Bronze: { hits: 0, rawHits: 0, candidates: 0, accuracy: 0, rawAccuracy: 0 }
    };

    console.log(`\n📊 Processing ${testSet.length} draws...`);

    for (let i = 0; i < testSet.length; i++) {
        const targetDraw = testSet[i];
        const currentHistory = history.filter(d => d.date < targetDraw.date);

        if (currentHistory.length < 50) continue;

        // Get Current Rankings (Simulated based on that point in time? 
        // Ideally yes, but expensive. We'll use CURRENT rankings as approximation for "System Selection",
        // but the systems themselves will predict based on history.
        // This assumes the "Top 3" today were also good back then. 
        // For a true backtest we'd need dynamic ranking, but let's stick to the current "Elite" definition.)

        // Actually, let's fetch the current rankings once.
        // (In a real scenario, the composition of Gold changes. 
        // But checking if "The Strategy of Top 3" works requires dynamic ranking.
        // Our `MedalSystem` class DOES fetch dynamic rankings! 
        // So we can just instantiate Gold/Silver/Bronze and call generateTop10?
        // Wait, `MedalSystem` calls `prisma.systemRanking`. That table is static (current state).
        // So `MedalSystem` will always use the CURRENT Top 3.
        // That's acceptable for this analysis: "How would the CURRENT Top 3 have performed?"

        const actual = JSON.parse(targetDraw.numbers as string) as number[];

        // Test each Ensemble
        for (const type of ['Gold', 'Silver', 'Bronze'] as const) {
            let topN = 3;
            if (type === 'Silver') topN = 6;
            if (type === 'Bronze') topN = 9;

            // Manual Ensemble Logic to get Raw Candidates
            // (We can't just call generateTop10 because we want the raw votes)

            // 1. Get Top N Systems (Current)
            // We need to fetch this inside the loop if we wanted dynamic, but we are using static DB rankings.
            // So we can fetch once outside.
            // But wait, `MedalSystem` logic is:
            // fetch rankings -> weight = accuracy/50 -> vote.

            // Let's replicate that logic here.
        }
    }

    // FETCH RANKINGS ONCE
    const allRankings = await prisma.systemRanking.findMany({
        orderBy: { avgAccuracy: 'desc' },
        take: 12 // Max needed for Platinum/Bronze
    });

    for (let i = 0; i < testSet.length; i++) {
        const targetDraw = testSet[i];
        const currentHistory = history.filter(d => d.date < targetDraw.date);
        const actual = JSON.parse(targetDraw.numbers as string) as number[];

        for (const type of ['Gold', 'Silver', 'Bronze'] as const) {
            let topN = 3;
            if (type === 'Silver') topN = 6;
            if (type === 'Bronze') topN = 9;

            const myRankings = allRankings.slice(0, topN);
            const votes: Record<number, number> = {};

            for (const rank of myRankings) {
                const system = rankedSystems.find(s => s.name === rank.systemName);
                if (!system) continue;

                const weight = rank.avgAccuracy / 50;
                const prediction = await system.generateTop10(currentHistory);

                prediction.forEach(num => {
                    votes[num] = (votes[num] || 0) + weight;
                });
            }

            const candidates = Object.keys(votes).map(n => parseInt(n));
            const sortedCandidates = candidates.sort((a, b) => votes[b] - votes[a]);

            // Raw Stats
            const rawHits = actual.filter(n => candidates.includes(n)).length;
            const rawAccuracy = (rawHits / 5) * 100; // Coverage

            // Top 25 Stats
            const top25 = sortedCandidates.slice(0, 25);
            const hits = actual.filter(n => top25.includes(n)).length;
            const accuracy = (hits / 5) * 100;

            stats[type].hits += hits;
            stats[type].accuracy += accuracy;
            stats[type].rawHits += rawHits;
            stats[type].rawAccuracy += rawAccuracy;
            stats[type].candidates += candidates.length;
        }

        if (i % 10 === 0) process.stdout.write('.');
    }

    console.log('\n\n🏁 Analysis Complete');

    console.table({
        Gold: {
            'Top 25 Accuracy': (stats.Gold.accuracy / testSet.length).toFixed(2) + '%',
            'Raw Coverage': (stats.Gold.rawAccuracy / testSet.length).toFixed(2) + '%',
            'Avg Candidates': (stats.Gold.candidates / testSet.length).toFixed(1)
        },
        Silver: {
            'Top 25 Accuracy': (stats.Silver.accuracy / testSet.length).toFixed(2) + '%',
            'Raw Coverage': (stats.Silver.rawAccuracy / testSet.length).toFixed(2) + '%',
            'Avg Candidates': (stats.Silver.candidates / testSet.length).toFixed(1)
        },
        Bronze: {
            'Top 25 Accuracy': (stats.Bronze.accuracy / testSet.length).toFixed(2) + '%',
            'Raw Coverage': (stats.Bronze.rawAccuracy / testSet.length).toFixed(2) + '%',
            'Avg Candidates': (stats.Bronze.candidates / testSet.length).toFixed(1)
        }
    });
}

main();
