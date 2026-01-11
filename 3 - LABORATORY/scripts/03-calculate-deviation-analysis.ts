/**
 * PROBABILITY LABORATORY - TABLE 3
 * Deviation Analysis (Observed vs Expected)
 * 
 * Compares actual positional frequencies against theoretical expectations
 * to identify numbers with statistically significant anomalous behavior.
 * 
 * Statistical Approach:
 * - Calculate expected frequency for each number in each position
 * - Compare with observed frequency
 * - Calculate chi-square statistic to test significance
 * - Identify numbers that deviate significantly from random distribution
 * 
 * Example:
 * Number 25 appears 202 times total.
 * If positions were random, we'd expect ~40 times in each position (202/5).
 * Actual: C1=11, C2=53, C3=82, C4=50, C5=6
 * Deviation shows strong bias toward C3 (middle position).
 */

import { PrismaClient as ProbabilityPrismaClient } from '../node_modules/.prisma/client-probability';

const probDb = new ProbabilityPrismaClient();

// Chi-square critical value for 4 degrees of freedom at 95% confidence
const CHI_SQUARE_CRITICAL = 9.488;

async function calculateDeviationAnalysis() {
    console.log('🎯 Starting Deviation Analysis...\n');

    try {
        // Step 1: Load frequency data
        console.log('📊 Loading positional frequency data...');
        const frequencies = await probDb.positionalFrequency.findMany({
            orderBy: { number: 'asc' }
        });

        if (frequencies.length === 0) {
            console.error('❌ No frequency data found! Please run 01-calculate-positional-frequency.ts first.');
            return;
        }

        console.log(`✅ Loaded frequency data for ${frequencies.length} numbers\n`);

        // Step 2: Calculate deviations for each number
        console.log('🔢 Calculating statistical deviations...\n');

        const deviations = frequencies.map(freq => {
            const total = freq.total_appearances;

            // For numbers that never appeared, skip calculation
            if (total === 0) {
                return {
                    number: freq.number,
                    c1_observed: 0,
                    c1_expected: 0,
                    c1_deviation: 0,
                    c2_observed: 0,
                    c2_expected: 0,
                    c2_deviation: 0,
                    c3_observed: 0,
                    c3_expected: 0,
                    c3_deviation: 0,
                    c4_observed: 0,
                    c4_expected: 0,
                    c4_deviation: 0,
                    c5_observed: 0,
                    c5_expected: 0,
                    c5_deviation: 0,
                    chiSquare: 0,
                    isSignificant: false
                };
            }

            // Expected frequency: if positions were random, each would have total/5
            const expectedPerPosition = total / 5;

            // Calculate deviation for each position: (observed - expected) / expected
            const c1_deviation = (freq.c1_count - expectedPerPosition) / expectedPerPosition;
            const c2_deviation = (freq.c2_count - expectedPerPosition) / expectedPerPosition;
            const c3_deviation = (freq.c3_count - expectedPerPosition) / expectedPerPosition;
            const c4_deviation = (freq.c4_count - expectedPerPosition) / expectedPerPosition;
            const c5_deviation = (freq.c5_count - expectedPerPosition) / expectedPerPosition;

            // Chi-square test: Σ((observed - expected)² / expected)
            const chiSquare =
                Math.pow(freq.c1_count - expectedPerPosition, 2) / expectedPerPosition +
                Math.pow(freq.c2_count - expectedPerPosition, 2) / expectedPerPosition +
                Math.pow(freq.c3_count - expectedPerPosition, 2) / expectedPerPosition +
                Math.pow(freq.c4_count - expectedPerPosition, 2) / expectedPerPosition +
                Math.pow(freq.c5_count - expectedPerPosition, 2) / expectedPerPosition;

            // Is this deviation statistically significant? (95% confidence)
            const isSignificant = chiSquare > CHI_SQUARE_CRITICAL;

            return {
                number: freq.number,
                c1_observed: freq.c1_count,
                c1_expected: expectedPerPosition,
                c1_deviation: c1_deviation,
                c2_observed: freq.c2_count,
                c2_expected: expectedPerPosition,
                c2_deviation: c2_deviation,
                c3_observed: freq.c3_count,
                c3_expected: expectedPerPosition,
                c3_deviation: c3_deviation,
                c4_observed: freq.c4_count,
                c4_expected: expectedPerPosition,
                c4_deviation: c4_deviation,
                c5_observed: freq.c5_count,
                c5_expected: expectedPerPosition,
                c5_deviation: c5_deviation,
                chiSquare: chiSquare,
                isSignificant: isSignificant
            };
        });

        console.log('✅ Calculated deviations for all numbers\n');

        // Step 3: Save to database
        console.log('💾 Saving results to probability database...');

        // Clear existing data
        await probDb.positionalDeviation.deleteMany({});

        // Insert all deviations
        await probDb.positionalDeviation.createMany({ data: deviations });

        console.log(`✅ Saved deviation data for all 50 numbers\n`);

        // Step 4: Display sample results
        console.log('📋 Sample Results (Deviations from Expected):\n');
        console.log('Number | Chi² | Signif? | Strongest Deviation');
        console.log('-------|------|---------|--------------------');

        // Show numbers with highest chi-square values
        const sortedByChiSquare = [...deviations]
            .filter(d => d.number > 1 && d.number < 50) // Exclude 1 and 50
            .sort((a, b) => b.chiSquare - a.chiSquare)
            .slice(0, 10);

        sortedByChiSquare.forEach(dev => {
            // Find position with largest absolute deviation
            const deviationValues = [
                { pos: 'C1', val: Math.abs(dev.c1_deviation) },
                { pos: 'C2', val: Math.abs(dev.c2_deviation) },
                { pos: 'C3', val: Math.abs(dev.c3_deviation) },
                { pos: 'C4', val: Math.abs(dev.c4_deviation) },
                { pos: 'C5', val: Math.abs(dev.c5_deviation) }
            ];
            const maxDev = deviationValues.reduce((max, curr) => curr.val > max.val ? curr : max);

            // Get the actual deviation value (with sign)
            const actualDev = dev[`${maxDev.pos.toLowerCase()}_deviation` as keyof typeof dev] as number;
            const direction = actualDev > 0 ? 'acima' : 'abaixo';

            console.log(
                `  ${dev.number.toString().padStart(2)}   | ` +
                `${dev.chiSquare.toFixed(1).padStart(4)} | ` +
                `${dev.isSignificant ? '  SIM  ' : '  NÃO  '} | ` +
                `${maxDev.pos}: ${(actualDev * 100).toFixed(0)}% ${direction} do esperado`
            );
        });

        // Step 5: Summary statistics
        const significantCount = deviations.filter(d => d.isSignificant).length;
        const totalAnalyzed = deviations.filter(d => d.number > 1 && d.number < 50).length;

        console.log('\n✨ Deviation Analysis Complete!\n');
        console.log(`📊 Números com desvio significativo: ${significantCount}/${frequencies.length}`);
        console.log(`📊 Números analisados (excl. 1 e 50): ${totalAnalyzed}`);
        console.log(`📊 Limite chi-quadrado (95%): ${CHI_SQUARE_CRITICAL}`);
        console.log('\n💡 Next step: Run export script to add this data to Excel\n');

    } catch (error) {
        console.error('❌ Error during calculation:', error);
        throw error;
    } finally {
        await probDb.$disconnect();
    }
}

// Run the calculation
calculateDeviationAnalysis()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
