/**
 * PROBABILITY LABORATORY - TABLE 1
 * Positional Frequency Analysis
 * 
 * Calculates how many times each number (1-50) appeared in each position (C1-C5)
 * after sorting the 5 drawn numbers in ascending order.
 * 
 * Example:
 * Draw: [23, 7, 45, 12, 38]
 * Sorted: [7, 12, 23, 38, 45]
 * Positions: C1=7, C2=12, C3=23, C4=38, C5=45
 */

import { PrismaClient as MainPrismaClient } from '@prisma/client';
import { PrismaClient as ProbabilityPrismaClient } from '../node_modules/.prisma/client-probability';

const mainDb = new MainPrismaClient({
    datasources: { db: { url: 'file:../../prisma/dev.db' } }
});

const probDb = new ProbabilityPrismaClient();

async function calculatePositionalFrequency() {
    console.log('🎯 Starting Positional Frequency Analysis...\n');

    try {
        // Step 1: Get all draws from main database
        console.log('📊 Loading all draws from main database...');
        const draws = await mainDb.draw.findMany({
            orderBy: { date: 'asc' },
            select: {
                id: true,
                date: true,
                numbers: true
            }
        });

        console.log(`✅ Loaded ${draws.length} draws\n`);

        // Step 2: Initialize frequency counters for all 50 numbers
        const frequencyMap = new Map<number, {
            c1: number;
            c2: number;
            c3: number;
            c4: number;
            c5: number;
            total: number;
        }>();

        // Initialize all numbers 1-50
        for (let num = 1; num <= 50; num++) {
            frequencyMap.set(num, { c1: 0, c2: 0, c3: 0, c4: 0, c5: 0, total: 0 });
        }

        // Step 3: Process each draw
        console.log('🔢 Processing draws and counting positional frequencies...');
        let processedCount = 0;
        const progressInterval = Math.floor(draws.length / 10); // Show progress every 10%

        for (const draw of draws) {
            // Parse numbers string (format: "[1,2,3,4,5]" as JSON array)
            let numbers: number[];

            try {
                numbers = JSON.parse(draw.numbers);

                if (!Array.isArray(numbers)) {
                    console.warn(`⚠️  Draw ${draw.id} numbers is not an array, skipping...`);
                    continue;
                }

                // Filter valid numbers
                numbers = numbers.filter(n => typeof n === 'number' && n >= 1 && n <= 50);

                if (numbers.length !== 5) {
                    console.warn(`⚠️  Draw ${draw.id} has ${numbers.length} numbers, skipping...`);
                    continue;
                }
            } catch (error) {
                console.warn(`⚠️  Draw ${draw.id} has invalid JSON format, skipping...`);
                continue;
            }

            // Sort numbers in ascending order
            const sorted = [...numbers].sort((a, b) => a - b);

            // Count each number in its position
            sorted.forEach((num, index) => {
                const freq = frequencyMap.get(num)!;

                switch (index) {
                    case 0: freq.c1++; break;
                    case 1: freq.c2++; break;
                    case 2: freq.c3++; break;
                    case 3: freq.c4++; break;
                    case 4: freq.c5++; break;
                }

                freq.total++;
            });

            processedCount++;
            if (processedCount % progressInterval === 0) {
                const percent = Math.round((processedCount / draws.length) * 100);
                console.log(`   Progress: ${percent}% (${processedCount}/${draws.length} draws)`);
            }
        }

        console.log(`✅ Processed ${processedCount} draws\n`);

        // Step 4: Save to database
        console.log('💾 Saving results to probability database...');

        // Clear existing data
        await probDb.positionalFrequency.deleteMany({});

        // Insert all 50 numbers with their frequencies
        const records = [];
        for (let num = 1; num <= 50; num++) {
            const freq = frequencyMap.get(num)!;
            records.push({
                number: num,
                c1_count: freq.c1,
                c2_count: freq.c2,
                c3_count: freq.c3,
                c4_count: freq.c4,
                c5_count: freq.c5,
                total_appearances: freq.total
            });
        }

        await probDb.positionalFrequency.createMany({ data: records });

        console.log(`✅ Saved frequency data for all 50 numbers\n`);

        // Step 5: Update metadata
        await probDb.calculationMetadata.upsert({
            where: { tableName: 'positional_frequency' },
            create: {
                tableName: 'positional_frequency',
                lastProcessedDrawId: draws[draws.length - 1].id,
                totalDrawsProcessed: processedCount
            },
            update: {
                lastProcessedDrawId: draws[draws.length - 1].id,
                totalDrawsProcessed: processedCount
            }
        });

        // Step 6: Display sample results
        console.log('📋 Sample Results:\n');
        console.log('Number | C1    | C2    | C3    | C4    | C5    | Total');
        console.log('-------|-------|-------|-------|-------|-------|-------');

        // Show interesting numbers: 1, 2, 25, 49, 50
        const sampleNumbers = [1, 2, 25, 49, 50];
        for (const num of sampleNumbers) {
            const freq = frequencyMap.get(num)!;
            console.log(
                `  ${num.toString().padStart(2)}   | ` +
                `${freq.c1.toString().padStart(5)} | ` +
                `${freq.c2.toString().padStart(5)} | ` +
                `${freq.c3.toString().padStart(5)} | ` +
                `${freq.c4.toString().padStart(5)} | ` +
                `${freq.c5.toString().padStart(5)} | ` +
                `${freq.total.toString().padStart(5)}`
            );
        }

        console.log('\n✨ Positional Frequency Analysis Complete!\n');
        console.log(`📊 Total draws analyzed: ${processedCount}`);
        console.log(`📅 Date range: ${draws[0].date.toISOString().split('T')[0]} to ${draws[draws.length - 1].date.toISOString().split('T')[0]}`);
        console.log('\n💡 Next step: Run export script to generate Excel file\n');

    } catch (error) {
        console.error('❌ Error during calculation:', error);
        throw error;
    } finally {
        await mainDb.$disconnect();
        await probDb.$disconnect();
    }
}

// Run the calculation
calculatePositionalFrequency()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
