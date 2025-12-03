
import { prisma } from '../lib/prisma';

async function main() {
    console.log('📊 Analyzing Position 1 Frequency (Last 100 Draws)...\n');

    const history = await prisma.draw.findMany({
        orderBy: { date: 'desc' },
        take: 100
    });

    const counts: Record<number, number> = {};

    // Initialize 1-27
    for (let i = 1; i <= 27; i++) counts[i] = 0;

    history.forEach(draw => {
        const nums = typeof draw.numbers === 'string' ? JSON.parse(draw.numbers) : draw.numbers as number[];
        nums.sort((a: number, b: number) => a - b);
        const p1 = nums[0];
        if (counts[p1] !== undefined) counts[p1]++;
        else counts[p1] = 1; // In case it's outside 1-27 (though previous check said max 27)
    });

    console.log('Num | Count | Graph');
    console.log('----|-------|----------------------');

    const sortedEntries = Object.entries(counts).sort((a, b) => parseInt(a[0]) - parseInt(b[0]));

    sortedEntries.forEach(([numStr, count]) => {
        if (count === 0) return; // Skip zeros to reduce noise? Or show them? Let's show all up to max.
        const num = parseInt(numStr);
        const bar = '█'.repeat(count);
        console.log(` ${num.toString().padEnd(2)} | ${count.toString().padEnd(5)} | ${bar}`);
    });
}

main();
