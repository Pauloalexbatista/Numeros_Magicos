
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

// 1. Force Load Environment
const envPath = path.resolve(__dirname, '.env');
dotenv.config({ path: envPath });

// 2. Initialize Prisma with explicit connection
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL || 'file:../../prisma/dev.db'
        }
    },
    log: [] // Suppress default logs
});

// Interfaces
interface CombinationResult {
    combo: string[];
    stats: {
        consensus: number;
        anti: number;
    };
}

// Helper: Generate Combinations
function getCombinations(arr: string[], k: number): string[][] {
    const results: string[][] = [];
    function build(current: string[], start: number) {
        if (current.length === k) {
            results.push([...current]);
            return;
        }
        for (let i = start; i < arr.length; i++) {
            build([...current, arr[i]], i + 1);
        }
    }
    build([], 0);
    return results;
}

async function main() {
    // 3. Fetch Data
    console.log('Fetching data...');
    const allPredictions = await prisma.systemPrediction.findMany({
        select: {
            systemName: true,
            drawId: true,
            prediction: true
        }
    });

    const historicalDraws = await prisma.draw.findMany({
        select: {
            id: true,
            numbers: true
        }
    });

    const systemNames = [...new Set(allPredictions.map(p => p.systemName))];
    console.log(`Loaded ${allPredictions.length} predictions for ${systemNames.length} systems.`);

    // 4. Test Logic (Voting Consensus)
    // Map: DrawID -> Prediction[]
    const predictionsByDraw = new Map<number, any[]>();
    allPredictions.forEach(p => {
        if (!predictionsByDraw.has(p.drawId)) predictionsByDraw.set(p.drawId, []);
        predictionsByDraw.get(p.drawId)?.push(p);
    });

    // Determine "Consensus" for a combination
    function testCombination(systems: string[]): { consensus: number, anti: number } {
        let consensusHits = 0;
        let antiHits = 0;
        let validDraws = 0;

        // Test last 100 draws
        const testDraws = historicalDraws.slice(-100);

        testDraws.forEach(draw => {
            const preds = predictionsByDraw.get(draw.id)?.filter(p => systems.includes(p.systemName));
            if (!preds || preds.length !== systems.length) return; // Only if all systems predicted

            validDraws++;

            // Parse Numbers
            const winningNums = draw.numbers.replace(/[\[\]]/g, '').split(',').map(n => parseInt(n.trim()));
            const allPredNums: number[] = [];

            preds.forEach(p => {
                const nums = p.prediction.replace(/[\[\]]/g, '').split(',').map(n => parseInt(n.trim()));
                allPredNums.push(...nums);
            });

            // Count frequency of each number predicted by the group
            const counts = new Map<number, number>();
            allPredNums.forEach(n => counts.set(n, (counts.get(n) || 0) + 1));

            // Consensus Numbers (predicted by majority)
            const threshold = Math.ceil(systems.length / 2);
            const consensusNums = Array.from(counts.entries())
                .filter(([_, count]) => count >= threshold)
                .map(([num, _]) => num);

            // Check if Consensus Numbers hit winning numbers
            // We score based on how many WINNING numbers were in the CONSENSUS set
            const hits = consensusNums.filter(n => winningNums.includes(n)).length;
            consensusHits += hits;

            // Anti-Consensus (Complementarity)
            // If one system fails completely (0-1 hits), does another save it (4-5 hits)?
            // Simplified: Union of all numbers should cover winning numbers
            const unionNums = new Set(allPredNums);
            const unionHits = winningNums.filter(n => unionNums.has(n)).length;
            antiHits += unionHits;
        });

        if (validDraws === 0) return { consensus: 0, anti: 0 };

        return {
            consensus: (consensusHits / validDraws / 5) * 100,
            anti: (antiHits / validDraws / 5) * 100
        };
    }

    // 5. Run combinations
    const results: { combo: string[], stats: { consensus: number, anti: number } }[] = [];

    // Test Pairs
    console.log('Testing Pairs...');
    const pairs = getCombinations(systemNames, 2);
    pairs.forEach((combo, idx) => {
        if (idx % 100 === 0) process.stdout.write('.');
        const stats = testCombination(combo);
        results.push({ combo, stats });
    });
    console.log('\nPairs done.');

    // Test Triplets
    console.log('Testing Triplets...');
    const triplets = getCombinations(systemNames, 3);
    triplets.forEach((combo, idx) => {
        if (idx % 100 === 0) process.stdout.write('.');
        const stats = testCombination(combo);
        results.push({ combo, stats });
    });
    console.log('\nTriplets done.');

    // --- NEW: FAST PORTFOLIO SEARCH (QUARTETS) ---
    console.log('Testing Quartets (Fast Portfolio Mode)...');

    // 1. Pre-calculate "Hit Vectors" for each system
    // Map: SystemName -> Set of DrawIDs where it hit >= 4
    const systemHits4 = new Map<string, Set<number>>();
    const systemHits5 = new Map<string, Set<number>>(); // Jackpots

    console.log('Building Hit Vectors...');
    // We need a generic map of DrawID -> WinningNumbers
    const drawNumbersMap = new Map<number, number[]>();
    historicalDraws.forEach(d => {
        const nums = d.numbers.replace(/[\[\]]/g, '').split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
        drawNumbersMap.set(d.id, nums);
    });

    const activeSystemNames = new Set(systemNames);

    allPredictions.forEach(p => {
        if (!activeSystemNames.has(p.systemName)) return;

        const winningNums = drawNumbersMap.get(p.drawId);
        if (!winningNums) return;

        const predNums = p.prediction.replace(/[\[\]]/g, '').split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
        const hits = predNums.filter(n => winningNums.includes(n)).length;

        if (hits >= 4) {
            if (!systemHits4.has(p.systemName)) systemHits4.set(p.systemName, new Set());
            systemHits4.get(p.systemName)?.add(p.drawId);
        }
        if (hits >= 5) {
            if (!systemHits5.has(p.systemName)) systemHits5.set(p.systemName, new Set());
            systemHits5.get(p.systemName)?.add(p.drawId);
        }
    });

    // 2. Generate Quartets
    const quartets = getCombinations(systemNames, 4);
    const quartetResults: { combo: string[], coverage: number, jackpots: number, combinedJackpots: number }[] = [];

    // 3. Score Quartets (Union of Sets)
    quartets.forEach((combo, idx) => {
        if (idx % 5000 === 0) process.stdout.write('.');

        // Union of Jackpots & Combined Jackpots
        const jackpotDraws = new Set<number>();
        const jackpotCounts = new Map<number, number>();

        combo.forEach(sys => {
            const hits = systemHits5.get(sys);
            if (hits) {
                hits.forEach(d => {
                    jackpotDraws.add(d);
                    jackpotCounts.set(d, (jackpotCounts.get(d) || 0) + 1);
                });
            }
        });

        const combinedJackpots = Array.from(jackpotCounts.values()).filter(c => c >= 2).length; // Draws with >= 2 JPs

        // Union of 4+ Hits
        const coverageDraws = new Set<number>();
        combo.forEach(sys => {
            const hits = systemHits4.get(sys);
            if (hits) hits.forEach(d => coverageDraws.add(d));
        });

        quartetResults.push({
            combo,
            coverage: coverageDraws.size,
            jackpots: jackpotDraws.size,
            combinedJackpots
        });
    });
    console.log('\nQuartets done.');

    // Sort Quartets
    // Sort by Total Jackpots first, then Combined Jackpots, then Coverage
    quartetResults.sort((a, b) => b.jackpots - a.jackpots || b.combinedJackpots - a.combinedJackpots || b.coverage - a.coverage);
    const topQuartets = quartetResults.slice(0, 5);

    // 6. Report Best
    const topConsensus = results.sort((a, b) => b.stats.consensus - a.stats.consensus).slice(0, 5);
    const topAnti = results.sort((a, b) => b.stats.anti - a.stats.anti).slice(0, 5);

    if (process.argv.includes('--json')) {
        // Use process.stdout.write directly to bypass the silenced console.log
        process.stdout.write(JSON.stringify({
            success: true,
            consensus: topConsensus.map(r => ({
                systems: r.combo,
                consensus: r.stats.consensus,
                anti: r.stats.anti
            })),
            anti: topAnti.map(r => ({
                systems: r.combo,
                consensus: r.stats.consensus,
                anti: r.stats.anti
            })),
            quartets: topQuartets.map(r => ({
                systems: r.combo,
                jackpots: r.jackpots,
                coverage: r.coverage,
                combinedJackpots: r.combinedJackpots
            }))
        }));
    } else {
        console.log('\n\n🏆 TOP 5 CONSENSUS COMBINATIONS (Voting):');
        topConsensus.forEach((r, i) => {
            console.log(`#${i + 1} [${r.stats.consensus.toFixed(2)}%] Systems: ${r.combo.join(', ')}`);
        });

        console.log('\n\n💀 TOP 5 ANTI-CONSENSUS COMBINATIONS (Voting):');
        topAnti.forEach((r, i) => {
            console.log(`#${i + 1} [${r.stats.anti.toFixed(2)}%] Systems: ${r.combo.join(', ')}`);
        });

        console.log('\n\n💎 TOP 5 PORTFOLIO QUARTETS (Combined Hits):');
        topQuartets.forEach((r, i) => {
            console.log(`#${i + 1} [${r.jackpots} Total JPs | ${r.combinedJackpots} Combined JPs | ${r.coverage} Draws] Systems: ${r.combo.join(', ')}`);
        });

        console.log('\nDone.');
    }
}

// Suppress logs if JSON mode
if (process.argv.includes('--json')) {
    console.log = () => { };
    console.error = () => { };
    console.info = () => { };
    console.warn = () => { };
}

main()
    .catch(e => {
        if (process.argv.includes('--json')) {
            process.stdout.write(JSON.stringify({ success: false, error: e.message }));
        } else {
            console.error(e);
        }
    })
    .finally(() => prisma.$disconnect());
