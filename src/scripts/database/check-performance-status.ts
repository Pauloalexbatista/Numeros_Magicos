
import { prisma } from '@/lib/prisma';
import { rankedSystems } from '@/services/ranked-systems';

async function checkStatus() {
    console.log('📊 CHECKING BACKFILL STATUS');
    console.log('═'.repeat(40));

    const totalDraws = await prisma.draw.count();
    console.log(`📚 Total Draws in DB: ${totalDraws}`);

    const performanceCount = await prisma.systemPerformance.count();
    console.log(`📈 Performance Records: ${performanceCount}`);

    // Check count per system
    console.log('\n🔍 Detailed Breakdown:');

    // Group by systemName
    const breakdown = await prisma.systemPerformance.groupBy({
        by: ['systemName'],
        _count: {
            id: true
        },
        _max: {
            drawId: true
        }
    });

    const breakdownMap = new Map(breakdown.map(b => [b.systemName, b]));

    let completed = 0;
    let inProgress = 0;
    let pending = 0;

    for (const system of rankedSystems) {
        const stats = breakdownMap.get(system.name);
        if (stats && stats._count?.id && stats._count.id > 100) { // Assuming >100 means reasonably populated
            // console.log(`✅ ${system.name.padEnd(30)}: ${stats._count.id} records (Max Draw: ${stats._max.drawId})`);
            completed++;
        } else if (stats && stats._count?.id && stats._count.id > 0) {
            console.log(`⚠️  ${system.name.padEnd(30)}: ${stats._count.id} records (INCOMPLETE)`);
            inProgress++;
        } else {
            console.log(`❌ ${system.name.padEnd(30)}: 0 records`);
            pending++;
        }
    }

    console.log('\nSUMMARY:');
    console.log(`✅ Completed Systems: ${completed}`);
    console.log(`⚠️  In Progress: ${inProgress}`);
    console.log(`❌ Pending: ${pending}`);

    // Check Star Performance
    const starCount = await prisma.starSystemPerformance.count();
    console.log(`\n🌟 Star Performance Records: ${starCount}`);

}

checkStatus()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
