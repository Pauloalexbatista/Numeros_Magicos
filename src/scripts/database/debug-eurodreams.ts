import { prisma } from '../../lib/prisma';
import { Draw } from '@prisma/client';

async function investigate() {
    console.log('🔍 Investigating EuroDreams Data Integrity...');
    
    // 1. Check for duplicate dates
    const dateCounts = await prisma.$queryRawUnsafe(`
        SELECT date, count(*) as count 
        FROM "Draw" 
        WHERE game = 'EURODREAMS' 
        GROUP BY date 
        HAVING count(*) > 1
    `);
    console.log('Duplicate Dates:', dateCounts);

    // 2. Sample multiple draws on the same date if any
    if (Array.isArray(dateCounts) && dateCounts.length > 0) {
        const sampleDate = dateCounts[0].date;
        const drawsOnDate = await prisma.draw.findMany({
            where: { game: 'EURODREAMS', date: sampleDate }
        });
        console.log(`Draws on ${sampleDate}:`, drawsOnDate.map(d => ({ id: d.id, numbers: d.numbers })));
    }

    // 3. Check for "Future Sight" (Self-inclusion in history)
    const sampleDraw = await prisma.draw.findFirst({
        where: { game: 'EURODREAMS' },
        orderBy: { date: 'desc' }
    });

    if (sampleDraw) {
        console.log(`\nTesting History for Draw ${sampleDraw.id} (${sampleDraw.date.toISOString()})`);
        const history = await prisma.draw.findMany({
            where: {
                game: 'EURODREAMS',
                date: { lt: sampleDraw.date }
            }
        });
        
        const selfMatch = history.find(h => h.id === sampleDraw.id);
        if (selfMatch) {
            console.error('❌ BUG FOUND: Draw includes ITSELF in history because of LT logic!');
        } else {
            console.log('✅ History logic seems correct (self-exclusion).');
        }
    }

    // 4. Check for Identical Numbers in adjacent draws
    const allDraws = await prisma.draw.findMany({
        where: { game: 'EURODREAMS' },
        orderBy: { date: 'desc' },
        take: 100
    });

    let exactRepeats = 0;
    for (let i = 0; i < allDraws.length - 1; i++) {
        if (allDraws[i].numbers === allDraws[i+1].numbers) {
            exactRepeats++;
        }
    }
    console.log(`Exact Number Repeats (consecutive): ${exactRepeats}/100`);
}

investigate().catch(console.error).finally(() => prisma.$disconnect());
