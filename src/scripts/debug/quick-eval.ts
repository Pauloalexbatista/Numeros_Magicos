
import { prisma } from '@/lib/prisma';
import { evaluateDraw } from '../../services/ranking';

async function main() {
    console.log('🔄 Quick Evaluate Latest Draw');
    const lastDraw = await prisma.draw.findFirst({ orderBy: { date: 'desc' } });
    if (!lastDraw) return;

    console.log(`Evaluating Draw ${lastDraw.id} (${lastDraw.date.toISOString()})...`);
    await evaluateDraw(lastDraw.id);
    console.log('✅ Done.');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
