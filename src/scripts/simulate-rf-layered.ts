
import { prisma } from '../lib/prisma';
import { Draw } from '@prisma/client';
import { RandomForestClassifier } from '../services/ml/randomForest';
import { generateTrainingData, calculateFeatures } from '../services/ml/featureEngineering';

// Ideal Averages
const IDEAL = {
    EVEN: 2.5,
    PRIME: 1.56,
    M3: 1.88,
    M5: 1.04,
    M7: 0.76
};

// Properties Helpers
const isPrime = (n: number) => [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47].includes(n);
const isM3 = (n: number) => n % 3 === 0;
const isM5 = (n: number) => n % 5 === 0;
const isM7 = (n: number) => n % 7 === 0;

async function main() {
    console.log('🧪 Simulating "Random Forest (Top 35) + Layers"...');

    const history = await prisma.draw.findMany({ orderBy: { date: 'asc' } });
    const testSet = history.slice(-100);

    let totalAccuracy = 0;

    // Train Model Once (or periodically) to save time in simulation
    // For accuracy, we should retrain or update, but let's use a sliding window approach
    // similar to the real system.

    console.log(`\n📊 Processing ${testSet.length} draws...`);

    for (let i = 0; i < testSet.length; i++) {
        const targetDraw = testSet[i];
        const currentHistory = history.filter(d => d.date < targetDraw.date);

        if (currentHistory.length < 200) continue;

        const parsedHistory = currentHistory.map(d => ({
            ...d,
            numbers: typeof d.numbers === 'string' ? JSON.parse(d.numbers) : d.numbers
        }));

        // --- STEP 1: RANDOM FOREST PREDICTION ---
        const TRAINING_WINDOW = 200;
        const classifier = new RandomForestClassifier(15, 8);
        const trainingHistory = parsedHistory.slice(-TRAINING_WINDOW);
        const trainingData = generateTrainingData(trainingHistory, 100);
        classifier.train(trainingData);

        const nextDrawFeatures = calculateFeatures(parsedHistory, parsedHistory.length);
        const predictions = nextDrawFeatures.map(feat => ({
            number: feat.number,
            prob: classifier.predict(feat)
        }));

        // Sort by probability
        predictions.sort((a, b) => b.prob - a.prob);

        // --- STEP 2: SELECT TOP 35 (RF Candidates) ---
        const top35 = predictions.slice(0, 35).map(p => ({
            n: p.number,
            baseScore: p.prob * 100 // Convert prob to score
        }));

        // --- STEP 3: ANALYZE TRENDS & APPLY LAYERS ---
        const recentDraws = parsedHistory.slice(-10).map(d => d.numbers as number[]);

        let sumEven = 0, sumPrime = 0, sumM3 = 0, sumM5 = 0, sumM7 = 0;
        recentDraws.forEach(nums => {
            sumEven += nums.filter(n => n % 2 === 0).length;
            sumPrime += nums.filter(isPrime).length;
            sumM3 += nums.filter(isM3).length;
            sumM5 += nums.filter(isM5).length;
            sumM7 += nums.filter(isM7).length;
        });

        const avgEven = sumEven / 10;
        const avgPrime = sumPrime / 10;
        const avgM3 = sumM3 / 10;
        const avgM5 = sumM5 / 10;
        const avgM7 = sumM7 / 10;

        const boostEven = avgEven < IDEAL.EVEN ? 1.2 : 1.0;
        const boostOdd = avgEven > IDEAL.EVEN ? 1.2 : 1.0;
        const boostPrime = avgPrime < IDEAL.PRIME ? 1.2 : 1.0;
        const boostM3 = avgM3 < IDEAL.M3 ? 1.2 : 1.0;
        const boostM5 = avgM5 < IDEAL.M5 ? 1.2 : 1.0;
        const boostM7 = avgM7 < IDEAL.M7 ? 1.2 : 1.0;

        // --- STEP 4: SCORE THE 35 CANDIDATES ---
        const scoredCandidates = top35.map(item => {
            let score = item.baseScore;

            if (item.n % 2 === 0) score *= boostEven;
            else score *= boostOdd;

            if (isPrime(item.n)) score *= boostPrime;
            if (isM3(item.n)) score *= boostM3;
            if (isM5(item.n)) score *= boostM5;
            if (isM7(item.n)) score *= boostM7;

            return { n: item.n, score };
        });

        // --- STEP 5: SELECT FINAL TOP 25 ---
        scoredCandidates.sort((a, b) => b.score - a.score);
        const finalPrediction = scoredCandidates.slice(0, 25).map(x => x.n);

        // Verify
        const actual = JSON.parse(targetDraw.numbers as string) as number[];
        const hits = actual.filter(n => finalPrediction.includes(n)).length;
        totalAccuracy += (hits / 5) * 100;

        process.stdout.write('.');
    }

    const avgAccuracy = totalAccuracy / testSet.length;
    console.log('\n\n🏁 Simulation Complete');
    console.log(`📈 Average Accuracy: ${avgAccuracy.toFixed(2)}%`);
}

main();
