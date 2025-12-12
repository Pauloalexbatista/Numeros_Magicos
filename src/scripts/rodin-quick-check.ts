import { prisma } from '../lib/prisma';

// Helper functions (same as before but simplified)
function getDigitalRoot(n: number): number {
    while (n > 9) {
        n = n.toString().split('').reduce((sum, d) => sum + parseInt(d), 0);
    }
    return n;
}

function getNumbersByRoot(root: number): number[] {
    const numbers: number[] = [];
    for (let i = 1; i <= 50; i++) {
        if (getDigitalRoot(i) === root) {
            numbers.push(i);
        }
    }
    return numbers;
}

function getColumnInRow(num: number, row: number): number {
    const numbersInRow = getNumbersByRoot(row);
    return numbersInRow.indexOf(num) + 1;
}

async function quickCheck() {
    console.log('🚀 Rodin Map Quick Check (Last 20 Draws)\n');

    const draws = await prisma.draw.findMany({
        orderBy: { date: 'desc' },
        take: 20
    });

    // Reverse to show chronological order
    const history = draws.reverse();

    console.log('Date       | Draw Numbers       | Dominant Root | Map Pattern');
    console.log('-----------|--------------------|---------------|------------');

    let previousRoot = 0;
    let oscillationHits = 0;
    let oscillationMisses = 0;

    for (const draw of history) {
        const nums = JSON.parse(draw.numbers) as number[];

        // Calculate roots
        const roots = nums.map(getDigitalRoot);

        // Find dominant root
        const rootCounts: Record<number, number> = {};
        roots.forEach(r => rootCounts[r] = (rootCounts[r] || 0) + 1);

        let validRoots = Object.keys(rootCounts).map(Number);
        // Sort by count desc, then value asc
        validRoots.sort((a, b) => {
            const diff = rootCounts[b] - rootCounts[a];
            if (diff !== 0) return diff;
            return a - b;
        });

        const dominantRoot = validRoots[0];

        // Check transition from previous
        let oscMarker = ' ';
        if (previousRoot !== 0) {
            // Check 3 <-> 6 oscillation
            if ((previousRoot === 3 && dominantRoot === 6) || (previousRoot === 6 && dominantRoot === 3)) {
                oscMarker = '✅ 3↔6';
                oscillationHits++;
            }
            // Check generic oscillation (just changing root is basic oscillation, but we look for specific pairs)
            else if (previousRoot === 3 && dominantRoot === 3) {
                oscMarker = '❌ Stagnant';
                oscillationMisses++;
            }
            else if (previousRoot === 6 && dominantRoot === 6) {
                oscMarker = '❌ Stagnant';
                oscillationMisses++;
            }
        }

        const dateStr = draw.date.toISOString().split('T')[0];
        const numsStr = nums.map(n => n.toString().padStart(2)).join(',');

        console.log(`${dateStr} | [${numsStr}] | Root ${dominantRoot} (${rootCounts[dominantRoot]})   | ${oscMarker}`);

        previousRoot = dominantRoot;
    }

    console.log('\n--- Quick Stats ---');
    console.log(`Total Draws Analyzed: ${history.length}`);
    // Note: This simple metric is just for discussion
}

quickCheck()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
