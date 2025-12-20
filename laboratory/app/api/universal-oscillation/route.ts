import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Helper: Calculate Digital Root (1-9)
function getRoot(num: number): number {
    while (num > 9) {
        num = num.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
    }
    return num;
}

export async function GET(request: Request) {
    try {
        // Parse Limit from URL (Default 500, Option 100)
        const { searchParams } = new URL(request.url);
        const limitParam = searchParams.get('limit');
        const historyLimit = limitParam ? parseInt(limitParam) : 500;

        // Ensure valid limit (clamp between 20 and 1000)
        const takeCount = Math.min(Math.max(historyLimit, 20), 1000) + 1; // +1 for start point

        // 1. Fetch History
        const history = await prisma.draw.findMany({
            orderBy: { id: 'desc' },
            take: takeCount,
            select: { id: true, numbers: true, date: true }
        });

        if (history.length < 20) {
            return NextResponse.json({ error: 'Histórico insuficiente' }, { status: 500 });
        }

        // Ordered oldest to newest for processing
        const draws = history.reverse();

        // 2. Build Transition Matrix (Last 500 draws)
        // matrix[PrevRoot][NextRoot] = Count
        const matrix: Record<number, Record<number, number>> = {};
        const rootCounts: Record<number, number> = {}; // Total occurrences of PrevRoot to normalize %

        // Initialize
        for (let i = 1; i <= 9; i++) {
            matrix[i] = {};
            rootCounts[i] = 0;
            for (let j = 1; j <= 9; j++) {
                matrix[i][j] = 0;
            }
        }

        // Calculate Transitions
        for (let i = 0; i < draws.length - 1; i++) {
            const currentDrawCols = parseNumbers(draws[i].numbers);
            const nextDrawCols = parseNumbers(draws[i + 1].numbers);

            // Calculate Dominant Root or analyze all numbers? 
            // Strategy: Use the "Sum Root" (Vortex Math standard). 
            // The sum of the draw represents the total energy state.

            const currentRoot = getDominantRoot(currentDrawCols);
            const nextRoot = getDominantRoot(nextDrawCols);

            if (currentRoot && nextRoot) {
                matrix[currentRoot][nextRoot]++;
                rootCounts[currentRoot]++;
            }
        }

        // Calculate Percentages
        const heatmap: Record<number, Record<number, number>> = {};
        for (let i = 1; i <= 9; i++) {
            heatmap[i] = {};
            for (let j = 1; j <= 9; j++) {
                const count = matrix[i][j];
                const total = rootCounts[i] || 1;
                heatmap[i][j] = parseFloat(((count / total) * 100).toFixed(1));
            }
        }

        // Helper to get numbers for a set of roots
        const getNumbersForRoots = (roots: number[]) => {
            const numbers: number[] = [];
            for (let i = 1; i <= 50; i++) {
                let sum = i;
                while (sum > 9) {
                    sum = sum.toString().split('').reduce((a, b) => a + parseInt(b), 0);
                }
                if (roots.includes(sum)) numbers.push(i);
            }
            return numbers;
        };

        // 3. Calculate Saturation (Last 20 draws)
        const recentDraws = draws.slice(-20);
        const saturationScores: Record<number, { count: number, saturation: number, status: string }> = {};

        const recentRootCounts: Record<number, number> = {};
        for (let i = 1; i <= 9; i++) recentRootCounts[i] = 0;

        let totalRoots = 0;
        recentDraws.forEach(d => {
            const nums = parseNumbers(d.numbers);
            nums.forEach(n => {
                const r = getRoot(n);
                recentRootCounts[r]++;
                totalRoots++;
            });
        });

        // Expected frequency (roughly equal distribution assumption for simplification, though 3/6/9 distribution varies slightly)
        // 1-8 have 5 or 6 numbers. 9 has 5. It's roughly 11% each.
        // Precise expected:
        // Roots 1,2,3,4,5 have 6 numbers (6/50 = 12%)
        // Roots 6,7,8,9 have 5 numbers (5/50 = 10%)

        for (let r = 1; r <= 9; r++) {
            const isLargeGroup = r <= 5;
            const prob = isLargeGroup ? 0.12 : 0.10;
            const expected = totalRoots * prob;
            const actual = recentRootCounts[r];
            const ratio = expected > 0 ? actual / expected : 0;

            let status = 'neutral';
            if (ratio > 1.3) status = 'hot';
            if (ratio < 0.7) status = 'cold';

            saturationScores[r] = {
                count: actual,
                saturation: parseFloat(ratio.toFixed(2)),
                status
            };
        }

        // 4. Generate Predictions based on Latest Draw
        const lastDraw = draws[draws.length - 1];
        const lastNumbers = parseNumbers(lastDraw.numbers);
        const lastDominantRoot = getDominantRoot(lastNumbers); // This is Sum Root now

        // Prepare new detailed structure
        const predictions = {
            lastDrawDate: lastDraw.date,
            lastDrawNumbers: lastNumbers,
            lastDrawRoots: lastNumbers.map(n => getRoot(n)),
            dominantRoot: lastDominantRoot,
            potentialRanking: [] as any[], // New Detailed Table
            validation: {
                totalDrawsAnalysed: draws.length - 1,
                top3HitRate: 0,
                // bottom3HitRate: 0, // Removed
                randomBaseline: 33.3,
                improvementFactor: 0,
                recentHistory: [] as any[], // New Last 10 Draws Log
                avgPoolHits: "0", // Initialize avgPoolHits
                randomPoolBaseline: "1.8" // Initialize baseline
            }
        };

        if (lastDominantRoot) {
            // --- Strategy B: Holistic (Sum Root) ---
            const holisticProbs = heatmap[lastDominantRoot];

            // --- Strategy A: Granular (Individual Roots) ---
            const granularVotes: Record<number, number> = {};
            predictions.lastDrawRoots.forEach(root => {
                const rootProbs = heatmap[root];
                // Top 2 destinations for this specific root
                const topDestinations = Object.entries(rootProbs)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 2)
                    .map(([r]) => parseInt(r));

                topDestinations.forEach(dest => {
                    granularVotes[dest] = (granularVotes[dest] || 0) + 1;
                });
            });

            // --- Combine into Potential Ranking ---
            const ranking: Array<{
                root: number;
                strategyA_votes: number;
                strategyB_prob: number;
                saturation_status: string;
                score: number;
            }> = [];
            for (let r = 1; r <= 9; r++) {
                const probB = holisticProbs[r] || 0;
                const votesA = granularVotes[r] || 0;
                const saturation = saturationScores[r];

                // Simple Score Metric for sorting: Prob + (Votes * 5)
                // Adjust weight as needed.
                const score = probB + (votesA * 5);

                ranking.push({
                    root: r,
                    strategyA_votes: votesA,
                    strategyB_prob: probB,
                    saturation_status: saturation.status,
                    score: score
                });
            }

            // Sort by Score Descending
            predictions.potentialRanking = ranking.sort((a, b) => b.score - a.score);
        }

        // 5. Backtest the Theory (Scientific Validation + Recent History)
        let top3Hits = 0;
        let validTransitionDraws = 0;

        // Validation Loop (All history)

        let totalPoolHits = 0;

        // Validation Loop (All history)
        // draws is DESC (0=New, 1=Old).
        // We want to predict Draw[i] (Target) using Draw[i+1] (Input).
        for (let i = 0; i < draws.length - 1; i++) {
            const targetDraw = draws[i];
            const inputDraw = draws[i + 1];

            const targetNumbers = parseNumbers(targetDraw.numbers);
            const inputNumbers = parseNumbers(inputDraw.numbers);

            const targetRoot = getDominantRoot(targetNumbers);
            const inputRoot = getDominantRoot(inputNumbers);

            if (targetRoot && inputRoot) {
                // Use inputRoot (Old) to predict targetRoot (New)
                const probs = heatmap[inputRoot] || {};
                const sortedLikelihoods = Object.entries(probs)
                    .sort(([, a], [, b]) => b - a)
                    .map(([r]) => parseInt(r));

                const predictedTop3 = sortedLikelihoods.slice(0, 3);

                if (predictedTop3.includes(targetRoot)) top3Hits++;
                validTransitionDraws++;

                // Calculate Pool Hits (Actual Numbers)
                const poolNumbers = getNumbersForRoots(predictedTop3);
                const hits = targetNumbers.filter(n => poolNumbers.includes(n)).length;
                totalPoolHits += hits;

                // Collect Last 10 Draws for Detail Log
                if (i < 10) { // Get first 10 (which are the newest)
                    predictions.validation.recentHistory.push({
                        date: targetDraw.date,
                        prevRoot: inputRoot,
                        prevNumbers: inputNumbers, // [NEW] The "Trigger" numbers
                        targetRoot: targetRoot,
                        targetNumbers: targetNumbers, // Transparency
                        predictedTop3: predictedTop3,
                        hit: predictedTop3.includes(targetRoot),
                        poolHits: hits,
                        poolSize: poolNumbers.length
                    });
                }
            }
        }

        // Calculate Avg Pool Hits & Baseline
        const validHistory = predictions.validation.recentHistory;
        const count = validHistory.length || 1;

        const recentHitsSum = validHistory.reduce((acc: number, curr: any) => acc + curr.poolHits, 0);
        const recentPoolSizeSum = validHistory.reduce((acc: number, curr: any) => acc + curr.poolSize, 0);

        const avgPoolHits = (recentHitsSum / count).toFixed(1);
        const avgPoolSize = (recentPoolSizeSum / count);
        const randomPoolBaseline = ((avgPoolSize / 50) * 5).toFixed(1); // Expected hits by random chance

        predictions.validation.avgPoolHits = avgPoolHits;
        predictions.validation.randomPoolBaseline = randomPoolBaseline; // Add to response

        // Sort history by date desc (already mostly sorted, but ensure)
        // Loop pushed Newest -> Oldest.
        // We want Oldest -> Newest for the UI log (Chronological flow).
        predictions.validation.recentHistory.reverse();



        if (validTransitionDraws > 0) {
            predictions.validation.top3HitRate = parseFloat(((top3Hits / validTransitionDraws) * 100).toFixed(1));
            // predictions.validation.bottom3HitRate = ... (omitted for cleaner UI)
            predictions.validation.improvementFactor = parseFloat((predictions.validation.top3HitRate / predictions.validation.randomBaseline).toFixed(2));
        }

        return NextResponse.json({
            matrix: heatmap,
            saturation: saturationScores,
            prediction: predictions
        });

    } catch (error: any) {
        console.error('Universal Oscillation API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

function parseNumbers(nums: string): number[] {
    return nums.replace(/[\[\]]/g, '')
        .split(',')
        .map(n => parseInt(n.trim()))
        .filter(n => !isNaN(n));
}

function getDominantRoot(numbers: number[]): number {
    // FIX: Use the "Root of the Sum" instead of "Mode of Roots"
    // This eliminates two biases:
    // 1. The tie-breaker bias (favouring 1, 2, 3)
    // 2. The distribution bias (Roots 1-5 having 6 numbers vs Roots 6-9 having 5)
    // The Digital Root of a Sum is mathematically uniform 1-9.
    const sum = numbers.reduce((a, b) => a + b, 0);
    return getRoot(sum);
}
