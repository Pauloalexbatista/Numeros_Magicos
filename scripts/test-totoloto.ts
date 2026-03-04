import { TotolotoService } from '../src/services/totolotoService';
import { prisma } from '../src/lib/prisma';

async function testTotoloto() {
    console.log('--- TESTING TOTOLOTO SCRAPER ---');
    const service = new TotolotoService();
    try {
        const latest = await service.fetchLatest();
        console.log('Latest Draw Found:', latest);

        const existing = await prisma.draw.findFirst({
            where: { game: 'TOTOLOTO', date: new Date(latest.date) }
        });

        console.log('Is in DB?', !!existing);
    } catch (err) {
        console.error('Scraper Error:', err);
    }
    await prisma.$disconnect();
}

testTotoloto();
