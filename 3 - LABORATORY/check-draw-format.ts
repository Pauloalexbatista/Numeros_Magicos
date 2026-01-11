/**
 * Quick diagnostic script to check draw data format
 */

import { PrismaClient } from '@prisma/client';

const db = new PrismaClient({
    datasources: { db: { url: 'file:../../prisma/dev.db' } }
});

async function checkDrawFormat() {
    const draws = await db.draw.findMany({
        take: 5,
        orderBy: { date: 'desc' }
    });

    console.log('Recent draws:');
    draws.forEach(draw => {
        console.log(`\nDraw ${draw.id} (${draw.date.toISOString().split('T')[0]}):`);
        console.log(`  Numbers: "${draw.numbers}"`);
        console.log(`  Stars: "${draw.stars}"`);
        console.log(`  Numbers (draw order): "${draw.numbersDrawOrder}"`);
    });

    await db.$disconnect();
}

checkDrawFormat();
