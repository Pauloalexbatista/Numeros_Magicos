import { prisma } from '@/lib/prisma';
import { evaluateDraw, evaluateDrawStars } from '@/services/ranking';

/**
 * Test evaluation of a single EuroDreams draw to identify bottlenecks
 */
async function testSingleDraw() {
    console.log('🧪 Testing Single Draw Evaluation...\n');

    const draw = await prisma.draw.findFirst({
        where: { game: 'EURODREAMS' },
        orderBy: { date: 'asc' }
    });

    if (!draw) {
        console.log('❌ No EuroDreams draws found');
        return;
    }

    console.log(`Testing draw from ${draw.date.toISOString().split('T')[0]}`);
    console.log(`Numbers: ${draw.numbers}`);
    console.log(`Dream Number: ${draw.stars}\n`);

    console.time('Number Systems Evaluation');
    try {
        await evaluateDraw(draw.id);
        console.timeEnd('Number Systems Evaluation');
    } catch (error) {
        console.error('❌ Number evaluation failed:', error);
    }

    console.time('Star Systems Evaluation');
    try {
        await evaluateDrawStars(draw.id);
        console.timeEnd('Star Systems Evaluation');
    } catch (error) {
        console.error('❌ Star evaluation failed:', error);
    }

    // Check results
    const performances = await prisma.systemPerformance.count({
        where: { drawId: draw.id }
    });

    console.log(`\n✅ Created ${performances} performance records`);
}

testSingleDraw()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
