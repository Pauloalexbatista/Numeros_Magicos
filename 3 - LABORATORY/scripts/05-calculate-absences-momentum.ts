/**
 * PROBABILITY LABORATORY - TABLES 5 & 6
 * Combined Calculator: Consecutive Absences + Momentum Score
 * 
 * Table 5: Tracks consecutive absence count for each number
 * Table 6: Tracks momentum score (+1 when appears, -1 when absent)
 * 
 * Both calculated in single pass for efficiency
 * UPDATED: Now uses 50-draw baseline, starts from draw 51
 */

import { PrismaClient as MainPrismaClient } from '@prisma/client';
import { PrismaClient as ProbabilityPrismaClient } from '../node_modules/.prisma/client-probability';

const mainDb = new MainPrismaClient({
    datasources: { db: { url: 'file:../../prisma/dev.db' } }
});

const probDb = new ProbabilityPrismaClient();

async function calculateAbsencesAndMomentum() {
    console.log('🎯 Starting Consecutive Absences & Momentum Analysis...\n');

    try {
        // Step 1: Get all draws
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

        const draws = allDraws.slice(50); // Start from draw 51
        console.log(`📈 Processing ${draws.length} draws (from draw 51 onwards)\n`);

        // Step 2: Initialize trackers
        const absenceCounts: { [key: number]: number } = {};
        const momentumScores: { [key: number]: number } = {};

        for (let num = 1; num <= 50; num++) {
            absenceCounts[num] = 0;
            momentumScores[num] = 0;
        }

        // Step 3: Clear existing data
        await probDb.consecutiveAbsences.deleteMany({});
        await probDb.momentumScore.deleteMany({});

        // Step 4: Process each draw
        console.log('🔢 Processing draws...');
        const absenceRecords = [];
        const momentumRecords = [];
        let processedCount = 0;
        const progressInterval = Math.floor(draws.length / 10);

        for (let i = 0; i < draws.length; i++) {
            const draw = draws[i];
            const drawNumber = 51 + i;

            try {
                const numbers = JSON.parse(draw.numbers);

                if (!Array.isArray(numbers) || numbers.length !== 5) {
                    console.warn(`⚠️  Draw ${draw.id} has invalid numbers, skipping...`);
                    continue;
                }

                const sortedNumbers = [...numbers].sort((a, b) => a - b);
                const appearedSet = new Set(numbers);

                // Update absence counts and momentum scores
                for (let num = 1; num <= 50; num++) {
                    if (appearedSet.has(num)) {
                        // Number appeared
                        absenceCounts[num] = 0; // Reset absence counter
                        momentumScores[num]++; // +1 to momentum
                    } else {
                        // Number absent
                        absenceCounts[num]++; // Increment absence counter
                        momentumScores[num]--; // -1 to momentum
                    }
                }

                // Create records (deep copy of current state)
                absenceRecords.push({
                    drawId: draw.id,
                    drawNumber: drawNumber,
                    drawDate: draw.date,
                    drawnNumbers: JSON.stringify(sortedNumbers),
                    absenceCounts: JSON.stringify({ ...absenceCounts })
                });

                momentumRecords.push({
                    drawId: draw.id,
                    drawNumber: drawNumber,
                    drawDate: draw.date,
                    drawnNumbers: JSON.stringify(sortedNumbers),
                    momentumScores: JSON.stringify({ ...momentumScores })
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

        // Step 5: Save to database in batches
        console.log('💾 Saving absence records...');
        const batchSize = 100;
        for (let i = 0; i < absenceRecords.length; i += batchSize) {
            const batch = absenceRecords.slice(i, i + batchSize);
            await probDb.consecutiveAbsences.createMany({ data: batch });
        }
        console.log(`✅ Saved ${absenceRecords.length} absence records\n`);

        console.log('💾 Saving momentum records...');
        for (let i = 0; i < momentumRecords.length; i += batchSize) {
            const batch = momentumRecords.slice(i, i + batchSize);
            await probDb.momentumScore.createMany({ data: batch });
        }
        console.log(`✅ Saved ${momentumRecords.length} momentum records\n`);

        // Step 6: Display sample results
        console.log('📋 Sample Results (Last Draw):\n');

        const lastAbsence = absenceRecords[absenceRecords.length - 1];
        const lastMomentum = momentumRecords[momentumRecords.length - 1];

        const absences = JSON.parse(lastAbsence.absenceCounts);
        const momentum = JSON.parse(lastMomentum.momentumScores);
        const drawnNums = JSON.parse(lastAbsence.drawnNumbers);

        console.log(`Draw ${lastAbsence.drawNumber} (${lastAbsence.drawDate.toISOString().split('T')[0]}):`);
        console.log(`  Drawn: [${drawnNums.join(', ')}]`);
        console.log('');
        console.log('  Consecutive Absences:');
        console.log(`    Num 1: ${absences[1]} draws, Num 25: ${absences[25]} draws, Num 50: ${absences[50]} draws`);
        console.log('');
        console.log('  Momentum Scores:');
        console.log(`    Num 1: ${momentum[1]}, Num 25: ${momentum[25]}, Num 50: ${momentum[50]}`);
        console.log('');

        // Find numbers with longest absences
        const absenceEntries = Object.entries(absences).map(([num, count]) => ({ num: parseInt(num), count: count as number }));
        const longestAbsences = absenceEntries.sort((a, b) => b.count - a.count).slice(0, 5);

        console.log('  Top 5 Longest Absences:');
        longestAbsences.forEach(({ num, count }) => {
            console.log(`    Número ${num}: ${count} sorteios ausente`);
        });
        console.log('');

        // Find numbers with highest/lowest momentum
        const momentumEntries = Object.entries(momentum).map(([num, score]) => ({ num: parseInt(num), score: score as number }));
        const highestMomentum = momentumEntries.sort((a, b) => b.score - a.score).slice(0, 3);
        const lowestMomentum = momentumEntries.sort((a, b) => a.score - b.score).slice(0, 3);

        console.log('  Top 3 Highest Momentum (hot numbers):');
        highestMomentum.forEach(({ num, score }) => {
            console.log(`    Número ${num}: ${score > 0 ? '+' : ''}${score}`);
        });
        console.log('');

        console.log('  Top 3 Lowest Momentum (cold numbers):');
        lowestMomentum.forEach(({ num, score }) => {
            console.log(`    Número ${num}: ${score}`);
        });

        // Step 7: Update metadata
        await probDb.calculationMetadata.upsert({
            where: { tableName: 'consecutive_absences' },
            create: {
                tableName: 'consecutive_absences',
                lastProcessedDrawId: draws[draws.length - 1].id,
                totalDrawsProcessed: processedCount
            },
            update: {
                lastProcessedDrawId: draws[draws.length - 1].id,
                totalDrawsProcessed: processedCount
            }
        });

        await probDb.calculationMetadata.upsert({
            where: { tableName: 'momentum_score' },
            create: {
                tableName: 'momentum_score',
                lastProcessedDrawId: draws[draws.length - 1].id,
                totalDrawsProcessed: processedCount
            },
            update: {
                lastProcessedDrawId: draws[draws.length - 1].id,
                totalDrawsProcessed: processedCount
            }
        });

        console.log('\n✨ Absences & Momentum Analysis Complete!\n');
        console.log(`📊 Total draws analyzed: ${processedCount}`);
        console.log(`📅 Date range: ${draws[0].date.toISOString().split('T')[0]} to ${draws[draws.length - 1].date.toISOString().split('T')[0]}`);
        console.log('\n💡 Next step: Export all tables to Excel\n');

    } catch (error) {
        console.error('❌ Error during calculation:', error);
        throw error;
    } finally {
        await mainDb.$disconnect();
        await probDb.$disconnect();
    }
}

// Run the calculation
calculateAbsencesAndMomentum()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
