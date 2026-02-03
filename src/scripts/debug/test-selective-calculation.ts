import { prisma } from '@/lib/prisma';
import { evaluateDraw, evaluateDrawStars } from '@/services/ranking';

/**
 * Test selective calculation with EuroDreams using only BASE systems
 */
async function testSelectiveCalculation() {
    console.log('🧪 Testing Selective Calculation\n');

    // Get one EuroDreams draw
    const draw = await prisma.draw.findFirst({
        where: { game: 'EURODREAMS' },
        orderBy: { date: 'desc' }
    });

    if (!draw) {
        console.log('❌ No EuroDreams draws found');
        return;
    }

    console.log(`Testing with draw from ${draw.date.toISOString().split('T')[0]}\n`);

    // Test 1: Calculate only BASE NUMBERS systems
    console.log('Test 1: BASE NUMBERS only');
    try {
        await evaluateDraw(draw.id, {
            systemTypes: ['BASE'],
            domain: 'NUMBERS'
        });
        console.log('✅ BASE NUMBERS calculation successful\n');
    } catch (error) {
        console.error('❌ BASE NUMBERS failed:', error.message);
    }

    // Test 2: Calculate only BASE STARS systems
    console.log('Test 2: BASE STARS only');
    try {
        await evaluateDrawStars(draw.id, {
            systemTypes: ['BASE']
        });
        console.log('✅ BASE STARS calculation successful\n');
    } catch (error) {
        console.error('❌ BASE STARS failed:', error.message);
    }

    // Check results
    const performances = await prisma.systemPerformance.count({
        where: { drawId: draw.id }
    });

    console.log(`\n📊 Total Performance Records: ${performances}`);

    // Show sample systems calculated
    const samples = await prisma.systemPerformance.findMany({
        where: { drawId: draw.id },
        take: 5,
        include: {
            system: {
                select: { systemType: true, domain: true, complexity: true }
            }
        }
    });

    console.log('\n📋 Sample Systems Calculated:');
    samples.forEach(p => {
        console.log(`  ${p.systemName}`);
        console.log(`    Type: ${p.system?.systemType}, Domain: ${p.system?.domain}, Complexity: ${p.system?.complexity}`);
        console.log(`    Hits: ${p.hits}, Accuracy: ${p.accuracy.toFixed(2)}%`);
    });

    await prisma.$disconnect();
}

testSelectiveCalculation();
