
import { prisma } from '../lib/prisma';

async function main() {
    console.log('📊 Analyzing Position Amplitude (Last 100 Draws)...\n');

    const history = await prisma.draw.findMany({
        orderBy: { date: 'desc' },
        take: 100
    });

    const positions: number[][] = [[], [], [], [], []];

    history.forEach(draw => {
        const nums = typeof draw.numbers === 'string' ? JSON.parse(draw.numbers) : draw.numbers as number[];
        nums.sort((a: number, b: number) => a - b);

        for (let i = 0; i < 5; i++) {
            if (nums[i]) positions[i].push(nums[i]);
        }
    });

    console.log('Pos | Min | Max | Amplitude | Avg');
    console.log('----|-----|-----|-----------|-----');

    for (let i = 0; i < 5; i++) {
        const values = positions[i];
        const min = Math.min(...values);
        const max = Math.max(...values);
        const amplitude = max - min;
        const avg = Math.round(values.reduce((a, b) => a + b, 0) / values.length);

        console.log(` ${i + 1}  | ${min.toString().padEnd(3)} | ${max.toString().padEnd(3)} | ${amplitude.toString().padEnd(9)} | ${avg}`);
    }
}

main();
