/**
 * PROBABILITY LABORATORY - TABLE 2
 * Positional Probability Analysis (Conditional Percentages)
 * 
 * Calculates: When number X appears in a draw, what % of time is it in each position?
 * 
 * Example:
 * Number 1: Always in C1 → C1=100%, C2=0%, C3=0%, C4=0%, C5=0%
 * Number 25: Distributed → C1=5%, C2=26%, C3=41%, C4=25%, C5=3%
 * 
 * This is calculated from Table 1 data:
 * Probability = (count in position / total appearances) * 100
 */

import { PrismaClient as ProbabilityPrismaClient } from '../node_modules/.prisma/client-probability';

const probDb = new ProbabilityPrismaClient();

async function calculatePositionalProbability() {
    console.log('🎯 Starting Positional Probability Analysis...\n');

    try {
        // Step 1: Load frequency data from Table 1
        console.log('📊 Loading positional frequency data...');
        const frequencies = await probDb.positionalFrequency.findMany({
            orderBy: { number: 'asc' }
        });

        if (frequencies.length === 0) {
            console.error('❌ No frequency data found! Please run 01-calculate-positional-frequency.ts first.');
            return;
        }

        console.log(`✅ Loaded frequency data for ${frequencies.length} numbers\n`);

        // Step 2: Calculate probabilities for each number
        console.log('🔢 Calculating conditional probabilities...');

        const probabilities = frequencies.map(freq => {
            const total = freq.total_appearances;

            // Avoid division by zero
            if (total === 0) {
                return {
                    number: freq.number,
                    c1_percent: 0,
                    c2_percent: 0,
                    c3_percent: 0,
                    c4_percent: 0,
                    c5_percent: 0
                };
            }

            // Calculate percentage for each position
            return {
                number: freq.number,
                c1_percent: (freq.c1_count / total) * 100,
                c2_percent: (freq.c2_count / total) * 100,
                c3_percent: (freq.c3_count / total) * 100,
                c4_percent: (freq.c4_count / total) * 100,
                c5_percent: (freq.c5_count / total) * 100
            };
        });

        console.log('✅ Calculated probabilities for all numbers\n');

        // Step 3: Save to database
        console.log('💾 Saving results to probability database...');

        // Clear existing data
        await probDb.positionalProbability.deleteMany({});

        // Insert all probabilities
        await probDb.positionalProbability.createMany({ data: probabilities });

        console.log(`✅ Saved probability data for all 50 numbers\n`);

        // Step 4: Display sample results
        console.log('📋 Sample Results (Conditional Probabilities):\n');
        console.log('Number | C1      | C2      | C3      | C4      | C5      | Sum');
        console.log('-------|---------|---------|---------|---------|---------|--------');

        // Show interesting numbers: 1, 2, 25, 49, 50
        const sampleNumbers = [1, 2, 25, 49, 50];
        for (const num of sampleNumbers) {
            const prob = probabilities.find(p => p.number === num)!;
            const sum = prob.c1_percent + prob.c2_percent + prob.c3_percent +
                prob.c4_percent + prob.c5_percent;

            console.log(
                `  ${num.toString().padStart(2)}   | ` +
                `${prob.c1_percent.toFixed(1).padStart(6)}% | ` +
                `${prob.c2_percent.toFixed(1).padStart(6)}% | ` +
                `${prob.c3_percent.toFixed(1).padStart(6)}% | ` +
                `${prob.c4_percent.toFixed(1).padStart(6)}% | ` +
                `${prob.c5_percent.toFixed(1).padStart(6)}% | ` +
                `${sum.toFixed(1).padStart(6)}%`
            );
        }

        console.log('\n✨ Positional Probability Analysis Complete!\n');

        // Step 5: Identify interesting patterns
        console.log('🔍 Interesting Patterns:\n');

        // Find numbers with highest concentration in one position
        const concentrations = probabilities.map(p => {
            const maxPercent = Math.max(p.c1_percent, p.c2_percent, p.c3_percent, p.c4_percent, p.c5_percent);
            const position = ['C1', 'C2', 'C3', 'C4', 'C5'][
                [p.c1_percent, p.c2_percent, p.c3_percent, p.c4_percent, p.c5_percent].indexOf(maxPercent)
            ];
            return { number: p.number, position, maxPercent };
        });

        // Most concentrated numbers (excluding 1 and 50 which are always 100%)
        const concentrated = concentrations
            .filter(c => c.number > 1 && c.number < 50)
            .sort((a, b) => b.maxPercent - a.maxPercent)
            .slice(0, 5);

        console.log('   Top 5 Most Concentrated Numbers (excluding 1 & 50):');
        concentrated.forEach(c => {
            console.log(`   - Número ${c.number}: ${c.maxPercent.toFixed(1)}% em ${c.position}`);
        });

        // Most distributed numbers (lowest max percentage)
        const distributed = concentrations
            .filter(c => c.number > 1 && c.number < 50)
            .sort((a, b) => a.maxPercent - b.maxPercent)
            .slice(0, 5);

        console.log('\n   Top 5 Most Distributed Numbers:');
        distributed.forEach(d => {
            console.log(`   - Número ${d.number}: Máximo ${d.maxPercent.toFixed(1)}% em ${d.position} (bem distribuído)`);
        });

        console.log('\n💡 Next step: Run export script to add this data to Excel\n');

    } catch (error) {
        console.error('❌ Error during calculation:', error);
        throw error;
    } finally {
        await probDb.$disconnect();
    }
}

// Run the calculation
calculatePositionalProbability()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
