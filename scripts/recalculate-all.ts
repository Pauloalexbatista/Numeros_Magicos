/**
 * Recalculate All Systems Script
 * 
 * Recalculates predictions and rankings for all 24 active systems
 * (12 number systems + 12 star systems) for EUROMILLIONS
 * 
 * IMPORTANT: Current schema only supports one game per system
 * Predictions: 15 numbers (5×3) and 6 stars for EuroMillions
 * 
 * Run with: npx tsx scripts/recalculate-all.ts
 */

import { PrismaClient } from '@prisma/client';
import { numberBaseSystems } from '../src/services/ranked-systems';
import { starBaseSystems } from '../src/services/star-systems';

const prisma = new PrismaClient();

async function main() {
    console.log('🔄 Starting System Recalculation...\n');
    console.log(`📊 Systems to process:`);
    console.log(`  • Number systems: ${numberBaseSystems.length}`);
    console.log(`  • Star systems: ${starBaseSystems.length}`);
    console.log(`  • Total: ${numberBaseSystems.length + starBaseSystems.length}\n`);

    let totalProcessed = 0;
    let totalErrors = 0;

    // Get EuroMillions history
    const history = await prisma.draw.findMany({
        where: { game: 'EUROMILLIONS' },
        orderBy: { date: 'desc' }
    });

    if (history.length === 0) {
        console.error('❌ No EuroMillions draws found!');
        process.exit(1);
    }

    console.log(`📊 Found ${history.length} EuroMillions draws\n`);

    // Process number systems
    console.log(`${'='.repeat(60)}`);
    console.log(`🔢 Processing ${numberBaseSystems.length} Number Systems`);
    console.log('='.repeat(60));

    for (const system of numberBaseSystems) {
        try {
            // Generate prediction (should return 15 numbers for EuroMillions)
            const prediction = await system.generateTop10(history);

            if (prediction.length !== 15) {
                console.warn(`  ⚠️  ${system.name}: Expected 15 numbers, got ${prediction.length}`);
            }

            await prisma.cachedPrediction.upsert({
                where: { systemName: system.name },
                update: {
                    numbers: JSON.stringify(prediction),
                    updatedAt: new Date()
                },
                create: {
                    systemName: system.name,
                    numbers: JSON.stringify(prediction)
                }
            });

            console.log(`  ✅ ${system.name}: ${prediction.length} numbers`);
            totalProcessed++;
        } catch (error) {
            console.error(`  ❌ ${system.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            totalErrors++;
        }
    }

    // Process star systems
    console.log(`\n${'='.repeat(60)}`);
    console.log(`⭐ Processing ${starBaseSystems.length} Star Systems`);
    console.log('='.repeat(60));

    for (const system of starBaseSystems) {
        try {
            // Generate prediction (should return 6 stars for EuroMillions)
            const prediction = await system.generatePrediction(history);

            if (prediction.length !== 6) {
                console.warn(`  ⚠️  ${system.name}: Expected 6 stars, got ${prediction.length}`);
            }

            // Star systems need their own cached prediction entry
            // We'll store stars in the numbers field for now (schema limitation)
            await prisma.cachedPrediction.upsert({
                where: { systemName: system.name },
                update: {
                    numbers: JSON.stringify(prediction),
                    updatedAt: new Date()
                },
                create: {
                    systemName: system.name,
                    numbers: JSON.stringify(prediction)
                }
            });

            console.log(`  ✅ ${system.name}: ${prediction.length} stars`);
            totalProcessed++;
        } catch (error) {
            console.error(`  ❌ ${system.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            totalErrors++;
        }
    }

    // Calculate rankings (simplified - just count hits in last 20 draws)
    console.log(`\n${'='.repeat(60)}`);
    console.log('📊 Calculating Rankings (Last 20 Draws)');
    console.log('='.repeat(60));

    const recentDraws = await prisma.draw.findMany({
        where: { game: 'EUROMILLIONS' },
        orderBy: { date: 'desc' },
        take: 20
    });

    // Get all cached predictions
    const predictions = await prisma.cachedPrediction.findMany();

    for (const pred of predictions) {
        let totalHits = 0;
        let totalPossible = 0;

        // Determine if this is a star system or number system
        const isStarSystem = starBaseSystems.some(s => s.name === pred.systemName);

        for (const draw of recentDraws) {
            const drawnNumbers = JSON.parse(draw.numbers) as number[];
            const drawnStars = JSON.parse(draw.stars) as number[];
            const predictedItems = JSON.parse(pred.numbers) as number[];

            if (isStarSystem) {
                // Star system: compare with drawn stars
                const starHits = predictedItems.filter(s => drawnStars.includes(s)).length;
                totalHits += starHits;
                totalPossible += drawnStars.length; // 2 stars per draw
            } else {
                // Number system: compare with drawn numbers
                const numberHits = predictedItems.filter(n => drawnNumbers.includes(n)).length;
                totalHits += numberHits;
                totalPossible += drawnNumbers.length; // 5 numbers per draw
            }
        }

        const accuracy = totalPossible > 0 ? (totalHits / totalPossible) * 100 : 0;

        await prisma.systemRanking.upsert({
            where: { systemName: pred.systemName },
            update: {
                avgAccuracy: accuracy,
                totalPredictions: recentDraws.length,
                lastUpdated: new Date()
            },
            create: {
                systemName: pred.systemName,
                avgAccuracy: accuracy,
                totalPredictions: recentDraws.length
            }
        });

        const domain = isStarSystem ? '⭐' : '🔢';
        console.log(`  ${domain} ${pred.systemName}: ${accuracy.toFixed(1)}% (${totalHits}/${totalPossible})`);
    }

    // Final summary
    console.log(`\n${'='.repeat(60)}`);
    console.log('✅ RECALCULATION COMPLETED!');
    console.log('='.repeat(60));
    console.log(`\n📊 Summary:`);
    console.log(`  • Systems processed: ${totalProcessed}`);
    console.log(`  • Errors: ${totalErrors}`);
    console.log(`  • Success rate: ${totalProcessed > 0 ? ((totalProcessed / (totalProcessed + totalErrors)) * 100).toFixed(1) : 0}%`);

    // Verify final counts
    const finalPredictions = await prisma.cachedPrediction.count();
    const finalRankings = await prisma.systemRanking.count();

    console.log(`\n📈 Database Status:`);
    console.log(`  • Cached Predictions: ${finalPredictions}`);
    console.log(`  • System Rankings: ${finalRankings}`);
    console.log(`  • Expected: 24 systems\n`);

    if (finalPredictions === 24) {
        console.log('✅ All 24 systems recalculated successfully!\n');
    } else {
        console.log(`⚠️  Warning: Expected 24 predictions, got ${finalPredictions}\n`);
    }
}

main()
    .catch((e) => {
        console.error('❌ Fatal error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
