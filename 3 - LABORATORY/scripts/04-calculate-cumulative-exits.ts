/**
 * PROBABILITY LABORATORY - TABLE 4
 * Cumulative Exits Counter (CORRECTED)
 * 
 * For each draw (starting from draw 51), tracks how many CONSECUTIVE draws
 * each number has NOT appeared.
 * 
 * LOGIC:
 * - When number appears → RESET to 0
 * - When number doesn't appear → INCREMENT +1
 * 
 * This is the INVERSE of Consecutive Absences!
 * 
 * Example:
 * Draw 51: Number 1 appeared → Counter = 0
 * Draw 52: Number 1 didn't appear → Counter = 1
 * Draw 53: Number 1 didn't appear → Counter = 2
 * Draw 54: Number 1 appeared → Counter = 0 (RESET)
 */

import { PrismaClient as MainPrismaClient } from '@prisma/client';
import { PrismaClient as ProbabilityPrismaClient } from '../node_modules/.prisma/client-probability';

const mainDb = new MainPrismaClient({
    datasources: { db: { url: 'file:../../prisma/dev.db' } }
});

const probDb = new ProbabilityPrismaClient();

async function calculateCumulativeExits() {
    console.log('🎯 Starting Cumulative Exits Analysis (Consecutive Draws Without Appearance)...\n');

    try {
        // Step 1: Get all draws from main database
        console.log('📊 Loading all draws from main database...');
        const allDraws = await mainDb.draw.findMany({
            orderBy: { date: 'asc' },
            select: {
                id: true,
                date: true,
                numbers: true
            }
        });

        console.log(`✅ Loaded ${allDraws.length} draws\n`);

        // Step 2: Start from draw 51 (need first 50 draws to establish baseline)
        const draws = allDraws.slice(50); // Skip first 50 draws
        console.log(`📈 Processing ${draws.length} draws (from draw 51 onwards)\n`);

        // Step 3: Initialize consecutive "no exit" counters
        const consecutiveNoExits: { [key: number]: number } = {};
        for (let num = 1; num <= 50; num++) {
            consecutiveNoExits[num] = 0;
        }

        // Establish baseline from first 50 draws
        console.log('🔢 Establishing baseline from first 50 draws...');
        for (let i = 0; i < 50; i++) {
            try {
                const numbers = JSON.parse(allDraws[i].numbers);
                const appearedSet = new Set(numbers);

                // Update counters based on first 50 draws
                for (let num = 1; num <= 50; num++) {
                    if (appearedSet.has(num)) {
                        consecutiveNoExits[num] = 0; // Reset when appears
                    } else {
                        consecutiveNoExits[num]++; // Increment when absent
                    }
                }
            } catch (error) {
                console.warn(`⚠️  Error parsing draw ${allDraws[i].id}, skipping...`);
            }
        }

        console.log('✅ Baseline established\n');

        // Step 4: Clear existing data
        await probDb.cumulativeExits.deleteMany({});

        // Step 5: Process each draw from 51 onwards
        console.log('🔢 Processing draws and tracking consecutive no-exits...');
        const records = [];
        let processedCount = 0;
        const progressInterval = Math.floor(draws.length / 10);

        for (let i = 0; i < draws.length; i++) {
            const draw = draws[i];
            const drawNumber = 51 + i; // Draw number starts at 51

            try {
                // Parse numbers
                const numbers = JSON.parse(draw.numbers);

                if (!Array.isArray(numbers) || numbers.length !== 5) {
                    console.warn(`⚠️  Draw ${draw.id} has invalid numbers, skipping...`);
                    continue;
                }

                const appearedSet = new Set(numbers);

                // Update consecutive no-exit counts
                for (let num = 1; num <= 50; num++) {
                    if (appearedSet.has(num)) {
                        consecutiveNoExits[num] = 0; // RESET when number appears
                    } else {
                        consecutiveNoExits[num]++; // INCREMENT when absent
                    }
                }

                // Sort numbers for display
                const sortedNumbers = [...numbers].sort((a, b) => a - b);

                // Create record
                records.push({
                    drawId: draw.id,
                    drawNumber: drawNumber,
                    drawDate: draw.date,
                    drawnNumbers: JSON.stringify(sortedNumbers),
                    cumulativeCounts: JSON.stringify(consecutiveNoExits)
                });

                processedCount++;
                if (processedCount % progressInterval === 0) {
                    const percent = Math.round((processedCount / draws.length) * 100);
                    console.log(`   Progress: ${percent}% (${processedCount}/${draws.length} draws)`);
                }
            } catch (error) {
                console.warn(`⚠️  Error processing draw ${draw.id}:`, error);
            }
        }

        console.log(`✅ Processed ${processedCount} draws\n`);

        // Step 6: Save to database in batches
        console.log('💾 Saving results to probability database...');
        const batchSize = 100;
        for (let i = 0; i < records.length; i += batchSize) {
            const batch = records.slice(i, i + batchSize);
            await probDb.cumulativeExits.createMany({ data: batch });

            if (i + batchSize < records.length) {
                console.log(`   Saved ${i + batchSize}/${records.length} records...`);
            }
        }

        console.log(`✅ Saved ${records.length} cumulative exit records\n`);

        // Step 7: Display sample results
        console.log('📋 Sample Results (Last 3 Draws):\n');

        const lastRecords = records.slice(-3);
        lastRecords.forEach(record => {
            const counts = JSON.parse(record.cumulativeCounts);
            const drawnNums = JSON.parse(record.drawnNumbers);

            console.log(`Draw ${record.drawNumber} (${record.drawDate.toISOString().split('T')[0]}):`);
            console.log(`  Drawn: [${drawnNums.join(', ')}]`);
            console.log(`  Consecutive no-exits - Num 1: ${counts[1]}, Num 25: ${counts[25]}, Num 50: ${counts[50]}`);
            console.log('');
        });

        // Step 8: Update metadata
        await probDb.calculationMetadata.upsert({
            where: { tableName: 'cumulative_exits' },
            create: {
                tableName: 'cumulative_exits',
                lastProcessedDrawId: draws[draws.length - 1].id,
                totalDrawsProcessed: processedCount
            },
            update: {
                lastProcessedDrawId: draws[draws.length - 1].id,
                totalDrawsProcessed: processedCount
            }
        });

        console.log('✨ Cumulative Exits Analysis Complete!\n');
        console.log(`📊 Total draws analyzed: ${processedCount}`);
        console.log(`📅 Date range: ${draws[0].date.toISOString().split('T')[0]} to ${draws[draws.length - 1].date.toISOString().split('T')[0]}`);
        console.log('\n💡 Next step: Calculate consecutive absences (Table 5)\n');

    } catch (error) {
        console.error('❌ Error during calculation:', error);
        throw error;
    } finally {
        await mainDb.$disconnect();
        await probDb.$disconnect();
    }
}

// Run the calculation
calculateCumulativeExits()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
