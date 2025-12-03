import { prisma } from '../lib/prisma';

async function main() {
    console.log('🧲 Elastic System: Anatomy of the Last Draw');

    // Get last 2 draws: 
    // Index 0 = Latest (The "Target" we wanted to predict)
    // Index 1 = Previous (The "Context" we used to predict)
    const draws = await prisma.draw.findMany({
        orderBy: { date: 'desc' },
        take: 52 // Need 50 for history + 2 for context
    });

    if (draws.length < 52) {
        console.log('Not enough history.');
        return;
    }

    const targetDraw = draws[0];
    const contextDraw = draws[1];
    const history = draws.slice(1, 51); // Last 50 draws BEFORE the target

    console.log(`\n📅 Target Draw: ${targetDraw.date.toISOString().split('T')[0]}`);
    console.log(`   Actual Numbers: ${targetDraw.numbers}`);

    console.log(`\n📅 Context Draw (Previous): ${contextDraw.date.toISOString().split('T')[0]}`);
    console.log(`   Previous Numbers: ${contextDraw.numbers}`);

    // 1. Calculate Means (based on history)
    const parsedHistory = history.map(d => JSON.parse(d.numbers) as number[]);
    const means = [0, 0, 0, 0, 0];

    for (let pos = 0; pos < 5; pos++) {
        const sum = parsedHistory.reduce((acc, nums) => acc + nums[pos], 0);
        means[pos] = sum / parsedHistory.length;
    }

    console.log('\n📊 Analysis by House (Position):');
    console.log('----------------------------------------------------------------');
    console.log('| Pos | Mean  | Prev Val | Diff  | Force Direction | Actual Val | Result |');
    console.log('----------------------------------------------------------------');

    const prevNums = JSON.parse(contextDraw.numbers) as number[];
    const actualNums = JSON.parse(targetDraw.numbers) as number[];

    let correctDirectionCount = 0;

    for (let pos = 0; pos < 5; pos++) {
        const mean = means[pos];
        const prev = prevNums[pos];
        const actual = actualNums[pos];
        const diff = prev - mean;

        let direction = '';
        let arrow = '';

        if (diff < 0) {
            direction = 'UP';
            arrow = '⬆️';
        } else {
            direction = 'DOWN';
            arrow = '⬇️';
        }

        // Did it obey?
        let result = '';
        let obeyed = false;

        if (direction === 'UP' && actual > prev) obeyed = true;
        if (direction === 'DOWN' && actual < prev) obeyed = true;

        if (obeyed) {
            result = '✅ OBEYED';
            correctDirectionCount++;
        } else {
            result = '❌ FAILED';
        }

        console.log(
            `| ${pos + 1}   | ${mean.toFixed(1)}  | ${prev.toString().padEnd(8)} | ${diff.toFixed(1).padEnd(5)} | ${arrow} ${direction.padEnd(4)}        | ${actual.toString().padEnd(10)} | ${result} |`
        );
    }
    console.log('----------------------------------------------------------------');

    console.log(`\n🎯 Summary:`);
    console.log(`   The Elastic Force correctly predicted the direction in ${correctDirectionCount}/5 houses.`);

    if (correctDirectionCount >= 3) {
        console.log('   ✅ The system worked well for this draw!');
    } else {
        console.log('   ⚠️ The system struggled with this draw (Randomness prevailed).');
    }
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
