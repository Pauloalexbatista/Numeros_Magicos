import { prisma } from './src/lib/prisma';
async function test() {
    const draws = await prisma.draw.findMany({
        where: { game: 'TOTOLOTO', date: { gte: new Date('2025-01-01'), lt: new Date('2026-01-01') } },
        orderBy: { date: 'asc' }
    });
    
    const drawDates = new Set(draws.map(d => d.date.toISOString().split('T')[0]));
    const missing = [];
    let d = new Date('2025-01-01T12:00:00Z');
    while (d < new Date('2026-01-01T12:00:00Z')) {
        const day = d.getUTCDay();
        if (day === 3 || day === 6) { 
            const dateStr = d.toISOString().split('T')[0];
            if (!drawDates.has(dateStr)) {
                missing.push(dateStr);
            }
        }
        d.setUTCDate(d.getUTCDate() + 1);
    }
    console.log('Missing in 2025:', missing.length);
    console.log('First 20 missing:', missing.slice(0, 20));
}
test().then(() => prisma.$disconnect());
