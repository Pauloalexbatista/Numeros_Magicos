/**
 * Test script for new star systems
 * Tests: Clustering Stars, Monte Carlo Stars, Vortex Stars + Anti-variants
 */

import { prisma } from '../lib/prisma';
import { ClusteringStarsSystem, MonteCarloStarsSystem, VortexStarsSystem, AntiStarSystem } from '../services/new-star-systems';

async function testNewStarSystems() {
    console.log('🌟 Testing New Star Systems...\n');

    // Fetch last 100 draws
    const draws = await prisma.draw.findMany({
        orderBy: { date: 'desc' },
        take: 100
    });

    console.log(`📊 Loaded ${draws.length} draws for testing\n`);

    // Initialize systems
    const systems = [
        new ClusteringStarsSystem(),
        new MonteCarloStarsSystem(),
        new VortexStarsSystem()
    ];

    // Test each system
    for (const system of systems) {
        console.log(`\n${'='.repeat(60)}`);
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
                console.log(`   - Length: ${prediction.length} (expected 6)`);
                console.log(`   - Range: ${prediction.every(s => s >= 1 && s <= 12) ? 'OK' : 'FAIL'}`);
                console.log(`   - Unique: ${new Set(prediction).size === 6 ? 'OK' : 'FAIL'}`);
            }

            // Test anti-system
            const antiSystem = new AntiStarSystem(system);
            const antiPrediction = antiSystem.generatePrediction(draws);

            console.log(`\n🔄 Anti-System: ${antiSystem.name}`);
            console.log(`🎯 Anti-Predicted Stars: ${antiPrediction.join(', ')}`);

            // Validate anti-system
            const hasNoOverlap = prediction.every(s => !antiPrediction.includes(s));
            const antiIsValid = antiPrediction.length === 6 &&
                antiPrediction.every(s => s >= 1 && s <= 12) &&
                new Set(antiPrediction).size === 6;

            if (antiIsValid && hasNoOverlap) {
                console.log(`✅ ANTI-SYSTEM VALID: No overlap with original`);
            } else {
                console.log(`❌ ANTI-SYSTEM INVALID`);
                console.log(`   - No overlap: ${hasNoOverlap ? 'OK' : 'FAIL'}`);
                console.log(`   - Valid: ${antiIsValid ? 'OK' : 'FAIL'}`);
            }

        } catch (error) {
            console.log(`❌ ERROR: ${error}`);
        }
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`✅ All tests completed!`);
    console.log(`${'='.repeat(60)}\n`);

    await prisma.$disconnect();
}

testNewStarSystems().catch(console.error);
