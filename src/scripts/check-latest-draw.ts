import { PrismaClient } from '@prisma/client';
import { EuroMillionsService } from '../services/euroMillionsService';

const prisma = new PrismaClient();
const service = new EuroMillionsService();

async function main() {
    console.log('--- Checking Database ---');
    const lastDraw = await prisma.draw.findFirst({
        orderBy: { date: 'desc' }
    });

    if (lastDraw) {
        console.log(`Latest DB Draw: #${lastDraw.id} - ${lastDraw.date.toISOString().split('T')[0]}`);
        console.log(`Numbers: ${lastDraw.numbers}, Stars: ${lastDraw.stars}`);
    } else {
        console.log('No draws in database.');
    }

    console.log('\n--- Debugging Fetch ---');
    try {
        const https = require('https');
        const agent = new https.Agent({ rejectUnauthorized: false });
        const response = await fetch('https://www.jogossantacasa.pt/web/SCCartazResult/euroMilhoes', { agent } as any);
        const text = await response.text();
        console.log('Status:', response.status);
        console.log('Content Preview:', text.substring(0, 500));

        const fs = require('fs');
        fs.writeFileSync('debug.html', text);
        console.log('Saved HTML to debug.html');

        // Check regex
        const numbersMatch = text.match(/<li>(\d+)<\/li>/g);
        console.log('Numbers Match:', numbersMatch ? numbersMatch.length : 'null');
    } catch (e) {
        console.error('Fetch Error:', e);
    }

    console.log('\n--- Checking Service Update ---');
    try {
        // We can't easily spy on the service internal fetch without modifying it,
        // but we can try to run an update and see what happens.
        console.log('Running updateDatabase()...');
        const result = await service.updateDatabase();
        console.log('Update Result:', result);

        const newLastDraw = await prisma.draw.findFirst({
            orderBy: { date: 'desc' }
        });
        console.log(`New Latest DB Draw: #${newLastDraw?.id} - ${newLastDraw?.date.toISOString().split('T')[0]}`);
    } catch (error) {
        console.error('Error updating database:', error);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
