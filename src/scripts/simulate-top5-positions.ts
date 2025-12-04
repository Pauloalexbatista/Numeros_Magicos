
import { prisma } from '../lib/prisma';

async function main() {
    console.log('🧪 Simulating "Top 5 Per Position"...');

    const history = await prisma.draw.findMany({ orderBy: { date: 'asc' } });
    const testSet = history.slice(-100);

    let totalAccuracy = 0;

    console.log(`\n📊 Processing ${testSet.length} draws...`);

    for (let i = 0; i < testSet.length; i++) {
        const targetDraw = testSet[i];
        const currentHistory = history.filter(d => d.date < targetDraw.date);

        if (currentHistory.length < 100) continue;

        // Use last 100 draws for frequency analysis
        const analysisWindow = currentHistory.slice(-100);

        const positionCounts: Record<number, Record<number, number>> = {
            0: {}, 1: {}, 2: {}, 3: {}, 4: {}
        };

        // Initialize counts
        for (let pos = 0; pos < 5; pos++) {
            for (let n = 1; n <= 50; n++) positionCounts[pos][n] = 0;
        }

        // Count frequencies per position
        analysisWindow.forEach(d => {
            const nums = typeof d.numbers === 'string' ? JSON.parse(d.numbers) : d.numbers as number[];
            nums.sort((a: number, b: number) => a - b);

            for (let pos = 0; pos < 5; pos++) {
                if (nums[pos]) positionCounts[pos][nums[pos]]++;
            }
        });

        // Select Top 5 for each position
        const predictionSet = new Set<number>();

        for (let pos = 0; pos < 5; pos++) {
            const counts = positionCounts[pos];
            const sorted = Object.entries(counts)
                .map(([n, count]) => ({ n: parseInt(n), count }))
                .sort((a, b) => b.count - a.count);

            // Take Top 5
            const top5 = sorted.slice(0, 5);
            top5.forEach(item => predictionSet.add(item.n));
        }

        // Convert to array
        let finalPrediction = Array.from(predictionSet);

        // If we have fewer than 25 (due to overlap), fill with next best from any position?
        // Or just evaluate as is. Usually overlap is minimal between distinct positions.
        // Let's strictly follow "Top 5 per house".

        // Verify
        const actual = JSON.parse(targetDraw.numbers as string) as number[];
        const hits = actual.filter(n => finalPrediction.includes(n)).length;
        totalAccuracy += (hits / 5) * 100;

        if (i % 20 === 0) process.stdout.write('.');
    }

    const avgAccuracy = totalAccuracy / testSet.length;
    console.log('\n\n🏁 Simulation Complete');
    console.log(`📈 Average Accuracy: ${avgAccuracy.toFixed(2)}%`);
}

main();
