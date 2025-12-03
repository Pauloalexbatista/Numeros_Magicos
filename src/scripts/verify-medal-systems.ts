import { prisma } from '../lib/prisma';

async function main() {
    console.log('🏅 Verifying Medal Systems (Gold, Silver, Bronze)...\n');

    const medalSystems = ['Sistema Ouro', 'Sistema Prata', 'Sistema Bronze'];

    for (const name of medalSystems) {
        console.log(`🔍 Checking ${name}...`);

        // 1. Check Ranking
        const ranking = await prisma.systemRanking.findUnique({
            where: { systemName: name }
        });

        if (ranking) {
            console.log(`   ✅ Ranking found: Accuracy=${ranking.avgAccuracy.toFixed(2)}%, Predictions=${ranking.totalPredictions}`);
        } else {
            console.log(`   ❌ Ranking NOT found!`);
        }

        // 2. Check Performance History
        const perfCount = await prisma.systemPerformance.count({
            where: { systemName: name }
        });

        if (perfCount > 0) {
            console.log(`   ✅ Performance history: ${perfCount} entries found.`);

            // Check for empty predictions
            const emptyPerf = await prisma.systemPerformance.count({
                where: { systemName: name, predictedNumbers: '[]' }
            });
            if (emptyPerf > 0) {
                console.log(`   ⚠️  WARNING: ${emptyPerf} entries have empty predictions!`);
            }
        } else {
            console.log(`   ❌ No performance history found!`);
        }

        // 3. Check Cached Prediction
        const cache = await prisma.cachedPrediction.findUnique({
            where: { systemName: name }
        });

        if (cache) {
            const numbers = JSON.parse(cache.numbers);
            console.log(`   ✅ Cached Prediction: [${numbers.join(', ')}] (Size: ${numbers.length})`);
        } else {
            console.log(`   ❌ No cached prediction found!`);
        }

        console.log('--------------------------------------------------');
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
