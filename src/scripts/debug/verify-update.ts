
import { prisma } from '@/lib/prisma';

async function main() {
    console.log('🔍 VERIFYING LATEST DRAW PERFORMANCE');
    console.log('====================================');

    const lastDraw = await prisma.draw.findFirst({
        orderBy: { date: 'desc' },
        include: {
            _count: {
                select: { systemPerformances: true }
            }
        }
    });

    if (!lastDraw) {
        console.error('❌ No draws found in database.');
        return;
    }

    console.log(`📅 Latest Draw Date: ${lastDraw.date.toISOString().split('T')[0]}`);
    console.log(`🔢 Numbers: ${lastDraw.numbers} + Stars: ${lastDraw.stars}`);
    console.log(`📊 System Performance Records: ${lastDraw._count.systemPerformances}`);

    if (lastDraw._count.systemPerformances > 0) {
        console.log('✅ SUCCESS: Systems have been calculated for this draw.');

        // Show a few examples
        const examples = await prisma.systemPerformance.findMany({
            where: { drawId: lastDraw.id },
            take: 3,
            select: { systemName: true, hits: true }
        });
        console.log('📝 Examples:', examples);
    } else {
        console.error('❌ FAILURE: No system calculations found for this draw.');
        console.log('   Run "npm run db:update" or "evaluateDraw" manually.');
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
