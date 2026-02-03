
import { prisma } from '@/lib/prisma';

async function main() {
    console.log('🌟 VERIFYING STAR SYSTEMS');
    console.log('=========================');

    const lastDraw = await prisma.draw.findFirst({
        orderBy: { date: 'desc' }
    });

    if (!lastDraw) return;
    console.log(`Draw: ${lastDraw.date.toISOString().split('T')[0]}`);

    const starPerf = await prisma.systemPerformance.findMany({
        where: {
            drawId: lastDraw.id,
            systemName: { contains: 'Sistema' } // "Sistema Ouro", etc might be stars? 
            // Or look for known star names.
            // Let's check ALL and filter by known Star System names if we can or just distinct names.
        }
    });

    // Better: Check active Star Systems from DB
    const allSystems = await prisma.rankedSystem.findMany({});
    // We assume some are stars. Usually "Star Frequency" etc.

    // Check specific name "Star"
    const stars = await prisma.systemPerformance.findMany({
        where: {
            drawId: lastDraw.id,
            OR: [
                { systemName: { contains: 'Star' } },
                { systemName: { contains: 'Estrela' } } // Portuguese
            ]
        }
    });

    console.log(`⭐ Star System Performances Found: ${stars.length}`);
    if (stars.length > 0) {
        console.log('✅ Examples:', stars.map(s => s.systemName).slice(0, 3));
    } else {
        console.warn('⚠️ No Star Systems found for this draw!');
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
