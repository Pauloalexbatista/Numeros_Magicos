
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: 'file:./prisma/dev.db',
        },
    },
});

async function main() {
    console.log('📊 Verifying Statistical Baseline...');

    // 1. Check Random System Ranking
    const randomRanking = await prisma.systemRanking.findUnique({
        where: { systemName: 'Random Generator' } // Name from RandomSystem.ts (need to confirm)
    });

    if (randomRanking) {
        console.log(`\n🎲 Random System (DB):`);
        console.log(`Accuracy: ${randomRanking.avgAccuracy.toFixed(2)}%`);
        console.log(`Predictions: ${randomRanking.totalPredictions}`);
    } else {
        console.log('⚠️ "Random Generator" not found in Ranking table.');
    }

    // 2. Compare with Top Systems
    const topSystems = await prisma.systemRanking.findMany({
        orderBy: { avgAccuracy: 'desc' },
        take: 5
    });

    console.log('\n🏆 Top 5 Systems:');
    topSystems.forEach((sys, i) => {
        console.log(`${i + 1}. ${sys.systemName}: ${sys.avgAccuracy.toFixed(2)}%`);
    });

    // 3. Calculate "True Random" Simulation (Real-time check)
    // Let's take last 1000 draws and simulate random 25 numbers
    console.log('\n🧮 Running Live Simulation (1000 draws)...');
    const draws = await prisma.draw.findMany({
        take: 1000,
        orderBy: { date: 'desc' }
    });

    let totalHits = 0;
    let totalDraws = draws.length;

    for (const draw of draws) {
        const actual = typeof draw.numbers === 'string' ? JSON.parse(draw.numbers) : draw.numbers;

        // Generate 25 random numbers (1-50)
        const pool = Array.from({ length: 50 }, (_, i) => i + 1);
        const randomPrediction = [];
        for (let i = 0; i < 25; i++) {
            const idx = Math.floor(Math.random() * pool.length);
            randomPrediction.push(pool[idx]);
            pool.splice(idx, 1);
        }

        const hits = actual.filter((n: number) => randomPrediction.includes(n)).length;
        totalHits += hits;
    }

    const avgHits = totalHits / totalDraws;
    const simAccuracy = (avgHits / 5) * 100;

    console.log(`\n🧪 Simulation Results:`);
    console.log(`Avg Hits: ${avgHits.toFixed(4)} (Expected: 2.5)`);
    console.log(`Avg Accuracy: ${simAccuracy.toFixed(2)}% (Expected: 50.00%)`);

    const diff = Math.abs(simAccuracy - 50);
    if (diff < 1) {
        console.log('✅ Baseline Confirmed: ~50%');
    } else {
        console.log('❌ Baseline Anomaly detected!');
    }
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
