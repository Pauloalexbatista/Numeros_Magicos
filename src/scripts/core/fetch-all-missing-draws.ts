/**
 * Fetch ALL missing draws since the last draw in database
 * This script repeatedly calls the API until no new draws are found
 */

import { EuroMillionsService } from '../../services/euroMillionsService';
import { prisma } from '@/lib/prisma';

async function main() {
    console.log('🔍 Checking for missing draws...\n');

    const service = new EuroMillionsService();
    let totalAdded = 0;
    let consecutiveFailures = 0;
    const MAX_ATTEMPTS = 10; // Safety limit

    // Get current last draw
    const lastDraw = await prisma.draw.findFirst({
        orderBy: { date: 'desc' }
    });

    if (lastDraw) {
        console.log(`📅 Last draw in database: ${lastDraw.date.toISOString().split('T')[0]}`);
    }

    console.log('🌍 Fetching from EuroMillions API...\n');

    // Keep trying to add draws until we find no new ones
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        console.log(`\n--- Attempt ${attempt}/${MAX_ATTEMPTS} ---`);

        try {
            const added = await service.updateDatabase();

            if (added) {
                totalAdded++;
                consecutiveFailures = 0;
                console.log(`✅ Draw ${totalAdded} added successfully!`);

                // Small delay to avoid hammering the API
                await new Promise(resolve => setTimeout(resolve, 1000));
            } else {
                consecutiveFailures++;
                console.log(`ℹ️  No new draw found (attempt ${consecutiveFailures})`);

                // If we fail twice in a row, we're probably caught up
                if (consecutiveFailures >= 2) {
                    console.log('\n✨ No more new draws found. Database is up to date!');
                    break;
                }
            }
        } catch (error) {
            console.error(`❌ Error on attempt ${attempt}:`, error);
            consecutiveFailures++;

            if (consecutiveFailures >= 3) {
                console.log('\n⚠️  Too many consecutive failures. Stopping.');
                break;
            }
        }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log(`📊 SUMMARY: ${totalAdded} new draw(s) added to database`);

    if (totalAdded > 0) {
        const newLastDraw = await prisma.draw.findFirst({
            orderBy: { date: 'desc' }
        });
        console.log(`📅 New last draw: ${newLastDraw?.date.toISOString().split('T')[0]}`);
    }
    console.log('='.repeat(60) + '\n');

    if (totalAdded === 0) {
        console.log('💤 Database was already up to date. No action needed.');
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
