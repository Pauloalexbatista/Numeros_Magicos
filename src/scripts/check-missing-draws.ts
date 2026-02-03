
import { prisma } from '../lib/prisma';

async function main() {
    console.log("Analyzing missing draws...");

    const games = [
        {
            name: 'EUROMILLIONS',
            start: new Date('2004-02-13'), // First draw
            days: [2, 5], // Tue(2), Fri(5)
            // Special rule: Fri only until 2011-05-10
            rules: [
                { until: new Date('2011-05-09'), days: [5] }, // Fridays only
                { from: new Date('2011-05-10'), days: [2, 5] } // Tue/Fri
            ]
        },
        {
            name: 'TOTOLOTO',
            start: new Date('1985-03-30'), // Assuming long history, but we'll check what allows
            // Let's rely on gathered data min date if earlier than expected, but usually Wed(3)/Sat(6)
            days: [3, 6],
            rules: [
                { from: new Date('1900-01-01'), days: [3, 6] } // Simplify to Wed/Sat for now (it changed over decades but Wed/Sat is current standard)
            ]
        },
        {
            name: 'EURODREAMS',
            start: new Date('2023-11-06'),
            days: [1, 4], // Mon(1), Thu(4)
            rules: [
                { from: new Date('2023-11-06'), days: [1, 4] }
            ]
        }
    ];

    const today = new Date();

    for (const game of games) {
        console.log(`\n=== ${game.name} ===`);

        // 1. Get all existing draw dates
        const existingDraws = await prisma.draw.findMany({
            where: { game: game.name },
            select: { date: true },
            orderBy: { date: 'asc' }
        });

        const existingDatesSet = new Set(existingDraws.map(d => d.date.toISOString().split('T')[0]));

        if (existingDraws.length === 0) {
            console.log("No data found.");
            continue;
        }

        const firstDbDate = existingDraws[0].date;
        const lastDbDate = existingDraws[existingDraws.length - 1].date;

        console.log(`Data Range: ${firstDbDate.toISOString().split('T')[0]} to ${lastDbDate.toISOString().split('T')[0]}`);
        console.log(`Total Records: ${existingDraws.length}`);

        // 2. Generate Expected Dates
        let missingByYear: Record<string, number> = {};
        let expectedByYear: Record<string, number> = {};
        let missingDates: string[] = [];

        // Start checking from the standard start date, or the first DB date if we only care about gaps in existing range?
        // User asked "quantos faltam", implying gaps or incomplete history. 
        // Let's use the DB start date as the anchor for older games to avoid flagging "1990 missing" if they only imported 2020+.
        // BUT for Euromillions/EuroDreams we likely want full history.
        // Let's start from game info start date if provided, otherwise firstDbDate.

        let currentDate = new Date(game.start);
        if (game.name === 'TOTOLOTO' && firstDbDate.getFullYear() > 1990) {
            // If Totoloto data starts late (e.g. 2020), maybe user only wants recent.
            // But let's stick to generating from Valid Start if we want "what is missing".
            // Actually, let's stick to the FIRST DB DATE for Totoloto to avoid listing 30 years of missing data if they only want partial.
            // Wait, for Euromillions we have full history (2004).
            // For Eurodreams we have full history (2023).
            // For Totoloto, if we only have 2024, listing 1990-2023 as missing is noisy.
            currentDate = game.name === 'TOTOLOTO' ? new Date('2000-01-01') : game.start; // Cap Totoloto at 2000 for sanity
        }

        // Align currentDate to start of day
        currentDate.setHours(0, 0, 0, 0);

        while (currentDate <= today) {
            const dateStr = currentDate.toISOString().split('T')[0];
            const year = currentDate.getFullYear().toString();
            const dayOfWeek = currentDate.getDay(); // 0-6 Sun-Sat

            // Check if this date is a draw day
            let isDrawDay = false;

            // Apply rules
            for (const rule of game.rules) {
                const afterStart = !rule.from || currentDate >= rule.from;
                const beforeEnd = !rule.until || currentDate <= rule.until;

                if (afterStart && beforeEnd) {
                    if (rule.days.includes(dayOfWeek)) {
                        isDrawDay = true;
                    }
                }
            }

            if (isDrawDay) {
                if (!expectedByYear[year]) expectedByYear[year] = 0;
                expectedByYear[year]++;

                if (!existingDatesSet.has(dateStr)) {
                    if (!missingByYear[year]) missingByYear[year] = 0;
                    missingByYear[year]++;
                    // missingDates.push(dateStr); // Uncomment to see specific dates
                }
            }

            // Next day
            currentDate.setDate(currentDate.getDate() + 1);
        }

        // Output
        console.log(`\nMissing Draws per Year:`);
        const years = Object.keys(expectedByYear).sort();
        let totalMissing = 0;

        // Table Header
        console.log(`${'Year'.padEnd(6)} | ${'Existing'.padEnd(8)} | ${'Expected'.padEnd(8)} | ${'Missing'.padEnd(8)} | ${'Status'}`);
        console.log('-'.repeat(50));

        for (const year of years) {
            const expected = expectedByYear[year];
            const missing = missingByYear[year] || 0;
            const existing = expected - missing; // Approx

            // Adjust existing count from actual data to be precise
            // (The loop generated 'expected', missing is purely calc. 
            // Better to count 'actual existing' from DB for that year to be sure)
            const actualExisting = existingDraws.filter(d => d.date.getFullYear().toString() === year).length;

            // "Missing" strictly based on calculated dates vs DB
            const calculatedMissingStr = missing > 0 ? missing.toString() : '-';

            // Status
            const isComplete = missing === 0;
            const status = isComplete ? '✅ OK' : '❌ Gaps';

            if (!isComplete || actualExisting !== expected) {
                totalMissing += missing;
                console.log(`${year.padEnd(6)} | ${actualExisting.toString().padEnd(8)} | ${expected.toString().padEnd(8)} | ${calculatedMissingStr.padEnd(8)} | ${status}`);
            }
        }

        if (totalMissing === 0) {
            console.log("All years complete! Zero missing draws.");
        } else {
            console.log(`\nTotal Missing: ${totalMissing}`);
        }
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
