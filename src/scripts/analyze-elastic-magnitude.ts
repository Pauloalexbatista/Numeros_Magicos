import { prisma } from '../lib/prisma';

async function main() {
    console.log('📊 ELASTIC MAGNITUDE ANALYSIS\n');

    const draws = await prisma.draw.findMany({
        orderBy: { date: 'asc' }
    });

    const parsedDraws = draws.map(d => JSON.parse(d.numbers) as number[]);

    // For each position
    for (let pos = 0; pos < 5; pos++) {
        console.log(`\n${'='.repeat(70)}`);
        console.log(`POSITION ${pos + 1}`);
        console.log('='.repeat(70));

        const upShifts: number[] = [];
        const downShifts: number[] = [];

        // Analyze each draw
        for (let i = 50; i < parsedDraws.length - 1; i++) {
            const current = parsedDraws[i];
            const next = parsedDraws[i + 1];

            // Calculate mean from previous 50
            const historyWindow = parsedDraws.slice(i - 50, i);
            const mean = historyWindow.reduce((sum, nums) => sum + nums[pos], 0) / 50;

            const currentVal = current[pos];
            const nextVal = next[pos];
            const diff = currentVal - mean;

            // If below mean (should go UP)
            if (diff < 0) {
                const shift = nextVal - currentVal;
                upShifts.push(shift);
            }
            // If above mean (should go DOWN)
            else if (diff > 0) {
                const shift = nextVal - currentVal;
                downShifts.push(shift);
            }
        }

        // Calculate statistics
        const avgUpShift = upShifts.length > 0
            ? upShifts.reduce((a, b) => a + b, 0) / upShifts.length
            : 0;

        const avgDownShift = downShifts.length > 0
            ? downShifts.reduce((a, b) => a + b, 0) / downShifts.length
            : 0;

        // Median
        const medianUp = upShifts.sort((a, b) => a - b)[Math.floor(upShifts.length / 2)] || 0;
        const medianDown = downShifts.sort((a, b) => a - b)[Math.floor(downShifts.length / 2)] || 0;

        console.log(`\nWhen BELOW mean (${upShifts.length} cases):`);
        console.log(`  Average shift: ${avgUpShift >= 0 ? '+' : ''}${avgUpShift.toFixed(2)}`);
        console.log(`  Median shift:  ${medianUp >= 0 ? '+' : ''}${medianUp}`);
        console.log(`  (Positive = went UP, Negative = went DOWN despite being below mean)`);

        console.log(`\nWhen ABOVE mean (${downShifts.length} cases):`);
        console.log(`  Average shift: ${avgDownShift >= 0 ? '+' : ''}${avgDownShift.toFixed(2)}`);
        console.log(`  Median shift:  ${medianDown >= 0 ? '+' : ''}${medianDown}`);
        console.log(`  (Negative = went DOWN, Positive = went UP despite being above mean)`);

        // Show current situation
        const currentDraw = parsedDraws[parsedDraws.length - 1];
        const lastDraw = parsedDraws[parsedDraws.length - 2];
        const recentMean = parsedDraws.slice(-51, -1).reduce((sum, d) => sum + d[pos], 0) / 50;
        const currentVal = currentDraw[pos];
        const lastVal = lastDraw[pos];

        console.log(`\n📍 CURRENT SITUATION:`);
        console.log(`  Last value: ${lastVal}`);
        console.log(`  Mean (50):  ${recentMean.toFixed(1)}`);

        if (lastVal < recentMean) {
            console.log(`  Force: UP ⬆️`);
            console.log(`  Expected shift: ${avgUpShift >= 0 ? '+' : ''}${avgUpShift.toFixed(1)}`);
            console.log(`  → Prediction: ${lastVal} + ${avgUpShift.toFixed(1)} = ${(lastVal + avgUpShift).toFixed(1)}`);
            console.log(`  Top 5 candidates: ${[
                Math.round(lastVal + avgUpShift - 2),
                Math.round(lastVal + avgUpShift - 1),
                Math.round(lastVal + avgUpShift),
                Math.round(lastVal + avgUpShift + 1),
                Math.round(lastVal + avgUpShift + 2)
            ].join(', ')}`);
        } else {
            console.log(`  Force: DOWN ⬇️`);
            console.log(`  Expected shift: ${avgDownShift >= 0 ? '+' : ''}${avgDownShift.toFixed(1)}`);
            console.log(`  → Prediction: ${lastVal} + ${avgDownShift.toFixed(1)} = ${(lastVal + avgDownShift).toFixed(1)}`);
            console.log(`  Top 5 candidates: ${[
                Math.round(lastVal + avgDownShift - 2),
                Math.round(lastVal + avgDownShift - 1),
                Math.round(lastVal + avgDownShift),
                Math.round(lastVal + avgDownShift + 1),
                Math.round(lastVal + avgDownShift + 2)
            ].join(', ')}`);
        }
    }
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
