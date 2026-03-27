import { prisma } from '../../lib/prisma';

async function main() {
    const LIMIT = 50;
    console.log(`🔢 Analyzing 1st Number (1ª Casa) - Last ${LIMIT} Draws...`);

    const draws = await prisma.draw.findMany({
        orderBy: { date: 'desc' },
        take: LIMIT
    });

    // Reverse to chronological order for visualization if needed, 
    // but for stats it doesn't matter.

    let sum = 0;
    let min = 51;
    let max = 0;
    const frequency: Record<number, number> = {};
    const values: number[] = [];

    for (const draw of draws) {
        try {
            // numbers is stored as JSON string of sorted array e.g. "[1, 15, 23, ...]"
            const numbers = (typeof draw.numbers === "string" ? JSON.parse(draw.numbers) : draw.numbers);

            if (Array.isArray(numbers) && numbers.length >= 1) {
                const n1 = numbers[0]; // 1st House

                values.push(n1);
                sum += n1;
                if (n1 < min) min = n1;
                if (n1 > max) max = n1;

                frequency[n1] = (frequency[n1] || 0) + 1;
            }
        } catch (e) {
            // ignore
        }
    }

    if (values.length === 0) {
        console.log('No valid data found.');
        return;
    }

    const avg = sum / values.length;

    // Mode
    const sortedFreq = Object.entries(frequency).sort((a, b) => b[1] - a[1]);
    const mode = sortedFreq[0];

    console.log(`\n📊 Results for 1st Number (Last ${values.length} draws):`);
    console.log(`   📐 Average (Média): ${avg.toFixed(2)}`);
    console.log(`   📉 Min: ${min}`);
    console.log(`   📈 Max: ${max}`);
    console.log(`   🏆 Mode (Moda): ${mode[0]} (appeared ${mode[1]} times)`);

    console.log('\n📋 Recent Values (Newest -> Oldest):');
    console.log(values.join(', '));
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
