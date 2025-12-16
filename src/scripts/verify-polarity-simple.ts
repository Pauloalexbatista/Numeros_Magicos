
import { prisma } from '../lib/prisma';

// Simple Digital Root
function getRoot(num: number): number {
    while (num > 9) {
        num = num.toString().split('').reduce((sum, digit) => sum + parseInt(digit), 0);
    }
    return num;
}

async function verify() {
    console.log('🧪 Verifying Polarity 3-6 Accuracy (Simple Script)\n');

    const draws = await prisma.draw.findMany({
        orderBy: { date: 'asc' } // Oldest first
    });

    console.log(`Total Draws: ${draws.length}`);

    // We need at least 2 draws to compare
    let hits = 0;
    let fails = 0;
    let ties = 0;
    let skipped = 0;

    // Start from index 0, compare with i+1
    for (let i = 0; i < draws.length - 1; i++) {
        const current = draws[i];
        const next = draws[i + 1];

        const nums = JSON.parse(current.numbers);
        const nextNums = JSON.parse(next.numbers);

        const count3 = nums.filter((n: number) => getRoot(n) === 3).length;
        const count6 = nums.filter((n: number) => getRoot(n) === 6).length;

        const nextCount3 = nextNums.filter((n: number) => getRoot(n) === 3).length;
        const nextCount6 = nextNums.filter((n: number) => getRoot(n) === 6).length;

        // Logic: Reversion to Mean
        // If 3 Dominates, Predict 6 will dominate next
        if (count3 > count6) {
            // Prediction: Next should have more 6s
            if (nextCount6 > nextCount3) hits++;
            else if (nextCount6 < nextCount3) fails++;
            else ties++;
        }
        // If 6 Dominates, Predict 3 will dominate next
        else if (count6 > count3) {
            // Prediction: Next should have more 3s
            if (nextCount3 > nextCount6) hits++;
            else if (nextCount3 < nextCount6) fails++;
            else ties++;
        }
        else {
            skipped++; // Draw was tied, no clear signal
        }
    }

    const totalValid = hits + fails;
    const accuracy = (hits / totalValid) * 100;

    console.log('\n📊 RESULTS:');
    console.log(`Hits: ${hits}`);
    console.log(`Fails: ${fails}`);
    console.log(`Ties (Next Draw): ${ties}`);
    console.log(`Skipped (No Signal): ${skipped}`);
    console.log('--------------------------------');
    console.log(`ACCURACY: ${accuracy.toFixed(2)}%`);
    console.log('--------------------------------');
}

verify()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
