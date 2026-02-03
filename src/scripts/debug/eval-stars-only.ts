
import { prisma } from '../../lib/prisma';
import { evaluateDrawStars } from '../../services/ranking';

async function main() {
    console.log('⭐ EVALUATING STARS FOR LATEST DRAW');
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
        console.error('❌ No draws found.');
        return;
    }

    console.log(`📅 Draw: ${lastDraw.date.toISOString().split('T')[0]}`);
    console.log(`📊 Current Performance Records: ${lastDraw._count.systemPerformances}`);
    console.log();

    await evaluateDrawStars(lastDraw.id);

    console.log();
    console.log('✅ Done! Run verify-stars.ts to confirm.');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
