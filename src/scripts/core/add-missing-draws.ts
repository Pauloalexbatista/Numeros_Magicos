/**
 * Manually add missing draws to the database
 * After adding, you MUST run the full system recalculation:
 * - turbo-backfill.ts (number systems)
 * - turbo-stars.ts (star systems)
 * - turbo-medals.ts (medal systems)
 * - turbo-ml.ts (ML models)
 */

import { prisma } from '@/lib/prisma';

interface ManualDraw {
    date: string; // YYYY-MM-DD format
    numbers: number[]; // 5 numbers in sorted order
    stars: number[]; // 2 stars in sorted order
    numbersDrawOrder: number[]; // 5 numbers in draw order
    starsDrawOrder: number[]; // 2 stars in draw order
    jackpot?: number;
    hasWinner?: boolean;
}

// ✅ MISSING DRAWS DATA (from Santa Casa website)
const missingDraws: ManualDraw[] = [
    {
        date: '2026-01-13', // Tuesday
        numbers: [6, 10, 18, 44, 47], // Sorted
        stars: [2, 10], // Sorted
        numbersDrawOrder: [47, 6, 44, 10, 18], // Draw order
        starsDrawOrder: [10, 2], // Draw order
        jackpot: 77000000.00,
        hasWinner: false
    },
    {
        date: '2026-01-16', // Friday
        numbers: [5, 17, 24, 29, 50], // Sorted
        stars: [5, 10], // Sorted
        numbersDrawOrder: [5, 24, 17, 50, 29], // Draw order
        starsDrawOrder: [10, 5], // Draw order
        jackpot: 87000000.00,
        hasWinner: false
    }
];

async function addMissingDraws() {
    console.log('🔧 Adding missing draws to database...\n');

    let added = 0;
    let skipped = 0;

    for (const draw of missingDraws) {
        // Validate data
        if (draw.numbers.length === 0 || draw.stars.length === 0) {
            console.log(`⚠️  Skipping ${draw.date} - no data provided`);
            skipped++;
            continue;
        }

        if (draw.numbers.length !== 5 || draw.stars.length !== 2) {
            console.log(`❌ Invalid data for ${draw.date} - wrong number count`);
            skipped++;
            continue;
        }

        const drawDate = new Date(draw.date);

        // Check if already exists
        const existing = await prisma.draw.findUnique({
            where: { date: drawDate }
        });

        if (existing) {
            console.log(`⏭️  ${draw.date} already exists - skipping`);
            skipped++;
            continue;
        }

        // Add to database
        try {
            await prisma.draw.create({
                data: {
                    date: drawDate,
                    numbers: JSON.stringify(draw.numbers),
                    stars: JSON.stringify(draw.stars),
                    numbersDrawOrder: JSON.stringify(draw.numbersDrawOrder),
                    starsDrawOrder: JSON.stringify(draw.starsDrawOrder),
                    jackpot: draw.jackpot || 0,
                    hasWinner: draw.hasWinner || false
                }
            });

            console.log(`✅ Added draw for ${draw.date}`);
            console.log(`   Numbers: ${draw.numbers.join(', ')} + ${draw.stars.join(', ')}`);
            added++;
        } catch (error) {
            console.error(`❌ Error adding ${draw.date}:`, error);
        }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`📊 SUMMARY:`);
    console.log(`   ✅ Added: ${added}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);
    console.log('='.repeat(60) + '\n');

    if (added > 0) {
        console.log('⚠️  IMPORTANT: You must now run the system recalculation:');
        console.log('   1. npx tsx src/scripts/core/turbo-backfill.ts');
        console.log('   2. npx tsx src/scripts/core/turbo-stars.ts');
        console.log('   3. npx tsx src/scripts/core/turbo-medals.ts');
        console.log('   4. npx tsx src/scripts/core/turbo-ml.ts');
        console.log('\n   OR simply run: .\\1-TOOLS\\2-MASTER_UPDATE.bat\n');
    }
}

addMissingDraws()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
