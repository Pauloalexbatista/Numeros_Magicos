
import { prisma } from '../../lib/prisma';

async function main() {
    console.log('⭐ DETAILED STAR SYSTEMS PERFORMANCE');
    console.log('====================================\n');

    const lastDraw = await prisma.draw.findFirst({
        orderBy: { date: 'desc' }
    });

    if (!lastDraw) return;

    const actualStars = (typeof lastDraw.stars === "string" ? JSON.parse(lastDraw.stars) : lastDraw.stars);
    console.log(`📅 Draw: ${lastDraw.date.toISOString().split('T')[0]}`);
    console.log(`⭐ Actual Stars: [${actualStars.join(', ')}]\n`);

    const starPerf = await prisma.systemPerformance.findMany({
        where: {
            drawId: lastDraw.id,
            OR: [
                { systemName: { contains: 'Star' } },
                { systemName: { contains: 'Estrela' } }
            ]
        },
        orderBy: { hits: 'desc' }
    });

    console.log('📊 RESULTS BY HITS:\n');

    const byHits: Record<number, any[]> = { 2: [], 1: [], 0: [] };

    starPerf.forEach(p => {
        byHits[p.hits] = byHits[p.hits] || [];
        byHits[p.hits].push(p);
    });

    for (let hits = 2; hits >= 0; hits--) {
        const systems = byHits[hits] || [];
        const emoji = hits === 2 ? '🏆' : hits === 1 ? '🥈' : '📊';
        console.log(`${emoji} ${hits} Hits: ${systems.length} systems`);

        systems.forEach(s => {
            const predicted = JSON.parse(s.predictedNumbers);
            console.log(`   - ${s.systemName}: [${predicted.join(', ')}]`);
        });
        console.log();
    }

    console.log(`\n📈 TOTAL: ${starPerf.length} star systems evaluated`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
