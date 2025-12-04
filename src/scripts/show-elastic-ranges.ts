import { prisma } from '../lib/prisma';

async function main() {
    console.log('📊 ELASTIC SYSTEM - Example Calculation\n');

    // Get last 51 draws
    const draws = await prisma.draw.findMany({
        orderBy: { date: 'desc' },
        take: 51
    });

    const last50 = draws.slice(1, 51).map(d => JSON.parse(d.numbers) as number[]);
    const lastDraw = JSON.parse(draws[0].numbers) as number[];

    console.log(`📅 Last Draw: ${draws[0].date.toISOString().split('T')[0]}`);
    console.log(`   Numbers: ${lastDraw.join(', ')}\n`);

    console.log('══════════════════════════════════════════════════════════════');
    console.log('  Pos | Last Val | Mean   | Force      | Valid Range');
    console.log('══════════════════════════════════════════════════════════════');

    for (let pos = 0; pos < 5; pos++) {
        const sum = last50.reduce((acc, nums) => acc + nums[pos], 0);
        const mean = sum / last50.length;
        const lastVal = lastDraw[pos];
        const diff = lastVal - mean;

        let force = '';
        let validRange = '';

        if (diff < 0) {
            // Should go UP
            force = `UP ⬆️`;
            validRange = `${lastVal} → 50 (aceita >= ${lastVal})`;
        } else if (diff > 0) {
            // Should go DOWN
            force = `DOWN ⬇️`;
            validRange = `1 → ${lastVal} (aceita <= ${lastVal})`;
        } else {
            force = 'NEUTRAL';
            validRange = 'All numbers valid';
        }

        const posNum = pos + 1;
        console.log(
            `  ${posNum}   | ${lastVal.toString().padEnd(8)} | ${mean.toFixed(1).padEnd(6)} | ${force.padEnd(10)} | ${validRange}`
        );
    }

    console.log('══════════════════════════════════════════════════════════════\n');

    console.log('💡 Interpretation:');
    console.log('   - If last value < mean → System accepts numbers >= last value');
    console.log('   - If last value > mean → System accepts numbers <= last value');
    console.log('   - Numbers in the "Valid Range" get MORE votes in Monte Carlo\n');

    console.log('Example for Position 1:');
    const pos1Val = lastDraw[0];
    const pos1Mean = last50.reduce((acc, nums) => acc + nums[0], 0) / last50.length;

    if (pos1Val < pos1Mean) {
        console.log(`   Last=${pos1Val}, Mean=${pos1Mean.toFixed(1)}`);
        console.log(`   Force says: GO UP`);
        console.log(`   Valid numbers: ${pos1Val}, ${pos1Val + 1}, ${pos1Val + 2}, ... , 50`);
        console.log(`   Numbers like ${pos1Val}, ${Math.round(pos1Mean)}, ${Math.round(pos1Mean) + 5} will get MANY votes`);
        console.log(`   Numbers like ${pos1Val - 5}, ${pos1Val - 10} will get FEW votes`);
    } else {
        console.log(`   Last=${pos1Val}, Mean=${pos1Mean.toFixed(1)}`);
        console.log(`   Force says: GO DOWN`);
        console.log(`   Valid numbers: 1, 2, 3, ... , ${pos1Val}`);
        console.log(`   Numbers like ${pos1Val}, ${Math.round(pos1Mean)}, ${Math.round(pos1Mean) - 5} will get MANY votes`);
        console.log(`   Numbers like ${pos1Val + 5}, ${pos1Val + 10} will get FEW votes`);
    }
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
