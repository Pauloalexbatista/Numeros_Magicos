
import { prisma } from '../lib/prisma';

async function checkTotolotoData() {
    console.log('Checking Totoloto Data...');

    // 1. Check Draws
    const drawCount = await prisma.draw.count({
        where: { game: 'TOTOLOTO' }
    });
    console.log(`Totoloto Draws: ${drawCount}`);

    if (drawCount === 0) {
        console.log('No draws found! We need to seed history.');
        return;
    }

    // 2. Check Number System Performance
    // We need to look up draws first to filter performance by game, 
    // or rely on a convention if systemName implies game. But safer via Draw.
    const performanceCount = await prisma.systemPerformance.count({
        where: {
            draw: {
                game: 'TOTOLOTO'
            }
        }
    });
    console.log(`SystemPerformance (Number) for Totoloto: ${performanceCount}`);

    // 3. Check Star System Performance
    const starPerformanceCount = await prisma.starSystemPerformance.count({
        where: {
            draw: {
                game: 'TOTOLOTO'
            }
        }
    });
    console.log(`StarSystemPerformance for Totoloto: ${starPerformanceCount}`);

    // 4. Check RankedSystems
    const systems = await prisma.rankedSystem.findMany({
        where: { game: 'TOTOLOTO', isActive: true }
    });
    console.log(`Active Totoloto Systems: ${systems.length}`);
    systems.forEach(s => console.log(` - ${s.name} (${s.domain})`));
}

checkTotolotoData()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
