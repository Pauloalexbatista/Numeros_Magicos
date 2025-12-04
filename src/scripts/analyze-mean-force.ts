import { prisma } from '../lib/prisma';

async function main() {
    console.log('🧲 Analyzing the "Pulling Force" of the Mean (1st House)...');

    const draws = await prisma.draw.findMany({
        orderBy: { date: 'asc' }
    });

    const values: number[] = [];
    for (const draw of draws) {
        try {
            const numbers = JSON.parse(draw.numbers);
            if (Array.isArray(numbers) && numbers.length >= 1) values.push(numbers[0]);
        } catch (e) { }
    }

    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    console.log(`   📐 Global Average: ${avg.toFixed(2)}`);

    // --- Q2: Distance vs Probability ---
    console.log('\n📊 Q2: Does Distance affect Probability of Correction?');

    const distanceStats: Record<number, { total: number, movedTowards: number }> = {};

    for (let i = 0; i < values.length - 1; i++) {
        const current = values[i];
        const next = values[i + 1];

        const dist = Math.abs(current - avg);
        const distInt = Math.floor(dist); // Group by integer distance

        if (!distanceStats[distInt]) distanceStats[distInt] = { total: 0, movedTowards: 0 };

        distanceStats[distInt].total++;

        // Check if moved towards mean
        if (current < avg) {
            if (next > current) distanceStats[distInt].movedTowards++;
        } else if (current > avg) {
            if (next < current) distanceStats[distInt].movedTowards++;
        }
    }

    console.log('   Distance | Total | Moved Towards Mean (%)');
    Object.keys(distanceStats).sort((a, b) => Number(a) - Number(b)).forEach(d => {
        const s = distanceStats[Number(d)];
        const pct = (s.movedTowards / s.total) * 100;
        console.log(`   ${d.padEnd(8)} | ${s.total.toString().padEnd(5)} | ${pct.toFixed(1)}%`);
    });

    // --- Q1: Climbing without Crossing ---
    console.log('\n🧗 Q1: Climbing/Descending towards Mean without Crossing');

    let climbCount = 0;
    let descendCount = 0;
    let totalMoves = 0;

    for (let i = 0; i < values.length - 1; i++) {
        const current = values[i];
        const next = values[i + 1];

        // Case 1: Below Mean, went UP, but didn't cross (Next < Avg)
        if (current < avg && next > current && next < avg) {
            climbCount++;
        }

        // Case 2: Above Mean, went DOWN, but didn't cross (Next > Avg)
        if (current > avg && next < current && next > avg) {
            descendCount++;
        }

        totalMoves++;
    }

    console.log(`   Total Transitions: ${totalMoves}`);
    console.log(`   ⬆️ Climbed UP towards mean (staying below): ${climbCount} times`);
    console.log(`   ⬇️ Climbed DOWN towards mean (staying above): ${descendCount} times`);


    // --- Strategy Check: "If 5 (Avg 8), are 1-4 safe to remove?" ---
    console.log('\n🛡️ Strategy Check: "If Below Mean, exclude lower numbers?"');

    let strategyTotal = 0;
    let strategySuccess = 0; // Next > Current

    for (let i = 0; i < values.length - 1; i++) {
        const current = values[i];
        const next = values[i + 1];

        if (current < avg) {
            strategyTotal++;
            if (next > current) {
                strategySuccess++;
            }
        }
    }

    const strategyPct = (strategyTotal > 0) ? (strategySuccess / strategyTotal) * 100 : 0;
    console.log(`   When Current < Average (${strategyTotal} times):`);
    console.log(`   Next was HIGHER: ${strategySuccess} times`);
    console.log(`   Next was LOWER/EQUAL: ${strategyTotal - strategySuccess} times`);
    console.log(`   ✅ "Bet UP" Success Rate: ${strategyPct.toFixed(1)}%`);

    // Specific check for "Close to Mean" vs "Far from Mean" for Strategy
    console.log('\n   Does it work better when further away?');
    const farThreshold = 3; // e.g. < 5 if avg is 8
    let farTotal = 0;
    let farSuccess = 0;

    for (let i = 0; i < values.length - 1; i++) {
        const current = values[i];
        const next = values[i + 1];

        if (current < (avg - farThreshold)) {
            farTotal++;
            if (next > current) farSuccess++;
        }
    }

    const farPct = (farTotal > 0) ? (farSuccess / farTotal) * 100 : 0;
    console.log(`   When Current < (Avg - ${farThreshold}) (Far below):`);
    console.log(`   ✅ "Bet UP" Success Rate: ${farPct.toFixed(1)}%`);

}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
