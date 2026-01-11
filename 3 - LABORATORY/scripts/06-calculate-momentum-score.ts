/**
 * PROBABILITY LABORATORY - TABLE 6
 * Momentum Score (CORRECTED - Rolling 50-Draw Window)
 * 
 * For each draw (starting from draw 51), calculates momentum score
 * based on the LAST 50 DRAWS (rolling window).
 * 
 * LOGIC:
 * - Look at the last 50 draws
 * - Count how many times each number appeared
 * - Momentum = (Appearances in last 50) - (Expected appearances)
 * - Expected = 50 draws × 5 numbers / 50 total numbers = 5 appearances
 * 
 * Example for Draw 100:
 * - Analyze draws 50-99 (last 50 draws)
 * - Number 25 appeared 8 times → Momentum = 8 - 5 = +3 (HOT)
 * - Number 10 appeared 2 times → Momentum = 2 - 5 = -3 (COLD)
 */

import { PrismaClient as MainPrismaClient } from '@prisma/client';
import { PrismaClient as ProbabilityPrismaClient } from '../node_modules/.prisma/client-probability';

const mainDb = new MainPrismaClient({
    datasources: { db: { url: 'file:../../prisma/dev.db' } }
});

const probDb = new ProbabilityPrismaClient();

const WINDOW_SIZE = 50;
const EXPECTED_APPEARANCES = 5; // 50 draws × 5 numbers / 50 total = 5

async function calculateMomentumScore() {
    console.log('🎯 Starting Momentum Score Analysis (Rolling 50-Draw Window)...\n');

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

        // Step 2: Clear existing data
        await probDb.momentumScore.deleteMany({});

        // Step 3: Process each draw
        console.log('🔢 Processing draws with rolling 50-draw window...');
        const records = [];
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

                // Get the last 50 draws (window)
                const windowStart = i; // Current position in draws array
                const windowDraws = allDraws.slice(windowStart, windowStart + WINDOW_SIZE);

                // Count appearances in the window
                const appearanceCounts: { [key: number]: number } = {};
                for (let num = 1; num <= 50; num++) {
                    appearanceCounts[num] = 0;
                }

                windowDraws.forEach(windowDraw => {
                    try {
                        const windowNumbers = JSON.parse(windowDraw.numbers);
                        windowNumbers.forEach((num: number) => {
                            if (num >= 1 && num <= 50) {
                                appearanceCounts[num]++;
                            }
                        });
                    } catch (error) {
                        // Skip invalid draws
                    }
                });

                // Calculate momentum scores
                const momentumScores: { [key: number]: number } = {};
                for (let num = 1; num <= 50; num++) {
                    momentumScores[num] = appearanceCounts[num] - EXPECTED_APPEARANCES;
                }

                const sortedNumbers = [...numbers].sort((a, b) => a - b);

                // Create record
                records.push({
                    drawId: draw.id,
                    drawNumber: drawNumber,
                    drawDate: draw.date,
                    drawnNumbers: JSON.stringify(sortedNumbers),
                    momentumScores: JSON.stringify(momentumScores)
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

        // Step 4: Save to database in batches
        console.log('💾 Saving momentum records...');
        const batchSize = 100;
        for (let i = 0; i < records.length; i += batchSize) {
            const batch = records.slice(i, i + batchSize);
            await probDb.momentumScore.createMany({ data: batch });
        }
        console.log(`✅ Saved ${records.length} momentum records\n`);

        // Step 5: Display sample results
        console.log('📋 Sample Results (Last Draw):\n');

        const lastRecord = records[records.length - 1];
        const momentum = JSON.parse(lastRecord.momentumScores);
        const drawnNums = JSON.parse(lastRecord.drawnNumbers);

        console.log(`Draw ${lastRecord.drawNumber} (${lastRecord.drawDate.toISOString().split('T')[0]}):`);
        console.log(`  Drawn: [${drawnNums.join(', ')}]`);
        console.log('');
        console.log('  Momentum Scores (last 50 draws):');
        console.log(`    Num 1: ${momentum[1] > 0 ? '+' : ''}${momentum[1]}, Num 25: ${momentum[25] > 0 ? '+' : ''}${momentum[25]}, Num 50: ${momentum[50] > 0 ? '+' : ''}${momentum[50]}`);
        console.log('');

        // Find hottest and coldest numbers
        const momentumEntries = Object.entries(momentum).map(([num, score]) => ({
            num: parseInt(num),
            score: score as number
        }));

        const hottest = momentumEntries.sort((a, b) => b.score - a.score).slice(0, 5);
        const coldest = momentumEntries.sort((a, b) => a.score - b.score).slice(0, 5);

        console.log('  Top 5 HOTTEST Numbers (most appearances in last 50 draws):');
        hottest.forEach(({ num, score }) => {
            console.log(`    Número ${num}: ${score > 0 ? '+' : ''}${score} (${EXPECTED_APPEARANCES + score} appearances)`);
        });
        console.log('');

        console.log('  Top 5 COLDEST Numbers (least appearances in last 50 draws):');
        coldest.forEach(({ num, score }) => {
            console.log(`    Número ${num}: ${score} (${EXPECTED_APPEARANCES + score} appearances)`);
        });

        // Step 6: Update metadata
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

        console.log('\n✨ Momentum Score Analysis Complete!\n');
        console.log(`📊 Total draws analyzed: ${processedCount}`);
        console.log(`📅 Date range: ${draws[0].date.toISOString().split('T')[0]} to ${draws[draws.length - 1].date.toISOString().split('T')[0]}`);
        console.log(`🪟 Window size: ${WINDOW_SIZE} draws`);
        console.log(`📈 Expected appearances per window: ${EXPECTED_APPEARANCES}`);
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
calculateMomentumScore()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
