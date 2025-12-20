/**
 * Test script for Average Plus One Stars system
 */

import { prisma } from '../lib/prisma';
import { AveragePlusOneStarsSystem, AntiStarSystem } from '../services/new-star-systems';

async function testAveragePlusOne() {
    console.log('🌟 Testing Average Plus One Stars System...\n');

    // Fetch last 100 draws
    const draws = await prisma.draw.findMany({
        orderBy: { date: 'desc' },
        take: 100
    });

    console.log(`📊 Loaded ${draws.length} draws for testing\n`);

    const system = new AveragePlusOneStarsSystem();

    console.log(`${'='.repeat(60)}`);
    console.log(`🔬 Testing: ${system.name}`);
    console.log(`📝 ${system.description}`);
    console.log(`${'='.repeat(60)}\n`);

    try {
        // Generate prediction
        const prediction = system.generatePrediction(draws);

        console.log(`✅ Prediction generated successfully`);
        console.log(`🎯 Predicted Stars: ${prediction.join(', ')}`);
        console.log(`📊 Count: ${prediction.length} stars`);

        // Validate
        const isValid = prediction.length === 6 &&
            prediction.every(s => s >= 1 && s <= 12) &&
            new Set(prediction).size === 6;

        if (isValid) {
            console.log(`✅ VALID: All checks passed`);
        } else {
            console.log(`❌ INVALID: Validation failed`);
        }

        // Show calculation details
        console.log(`\n📐 Calculation Details:`);

        // Calculate averages to show
        const recentDraws = draws.slice(0, 50);
        const position1Stars: number[] = [];
        const position2Stars: number[] = [];

        recentDraws.forEach(draw => {
            const stars = JSON.parse(draw.stars) as number[];
            const sorted = stars.sort((a, b) => a - b);
            if (sorted.length >= 2) {
                position1Stars.push(sorted[0]);
                position2Stars.push(sorted[1]);
            }
        });

        const avg1 = Math.round(
            position1Stars.reduce((sum, s) => sum + s, 0) / position1Stars.length
        );
        const avg2 = Math.round(
            position2Stars.reduce((sum, s) => sum + s, 0) / position2Stars.length
        );

        console.log(`   Position 1 Average: ${avg1} → Selected: ${avg1 - 1}, ${avg1}, ${avg1 + 1}`);
        console.log(`   Position 2 Average: ${avg2} → Selected: ${avg2 - 1}, ${avg2}, ${avg2 + 1}`);

        // Test anti-system
        const antiSystem = new AntiStarSystem(system);
        const antiPrediction = antiSystem.generatePrediction(draws);

        console.log(`\n🔄 Anti-System: ${antiSystem.name}`);
        console.log(`🎯 Anti-Predicted Stars: ${antiPrediction.join(', ')}`);

        const hasNoOverlap = prediction.every(s => !antiPrediction.includes(s));
        console.log(`✅ No overlap: ${hasNoOverlap ? 'YES' : 'NO'}`);

    } catch (error) {
        console.log(`❌ ERROR: ${error}`);
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`✅ Test completed!`);
    console.log(`${'='.repeat(60)}\n`);

    await prisma.$disconnect();
}

testAveragePlusOne().catch(console.error);
