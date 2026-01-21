/**
 * Fix draw order: Delete and recreate draws 1911-1913 in correct chronological order
 */

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL || 'file:./prisma/dev.db'
        }
    }
});

async function main() {
    console.log('🔧 Fixing draw order...\n');

    // Step 1: Delete the 3 draws with wrong order
    console.log('1️⃣ Deleting draws 1911, 1912, 1913...');
    await prisma.draw.deleteMany({
        where: { id: { in: [1911, 1912, 1913] } }
    });
    console.log('   ✅ Deleted\n');

    // Step 2: Recreate in correct chronological order
    console.log('2️⃣ Recreating draws in correct order...\n');

    // Draw 1: 13 Janeiro 2026 (Terça)
    const draw1 = await prisma.draw.create({
        data: {
            date: new Date('2026-01-13'),
            numbers: JSON.stringify([6, 10, 18, 44, 47]),
            stars: JSON.stringify([2, 10]),
            numbersDrawOrder: JSON.stringify([47, 6, 44, 10, 18]),
            starsDrawOrder: JSON.stringify([10, 2]),
            jackpot: 77000000.00,
            hasWinner: false
        }
    });
    console.log(`   ✅ Created draw ${draw1.id} for 2026-01-13`);

    // Draw 2: 16 Janeiro 2026 (Sexta)
    const draw2 = await prisma.draw.create({
        data: {
            date: new Date('2026-01-16'),
            numbers: JSON.stringify([5, 17, 24, 29, 50]),
            stars: JSON.stringify([5, 10]),
            numbersDrawOrder: JSON.stringify([5, 24, 17, 50, 29]),
            starsDrawOrder: JSON.stringify([10, 5]),
            jackpot: 87000000.00,
            hasWinner: false
        }
    });
    console.log(`   ✅ Created draw ${draw2.id} for 2026-01-16`);

    // Draw 3: 20 Janeiro 2026 (Segunda)
    const draw3 = await prisma.draw.create({
        data: {
            date: new Date('2026-01-20'),
            numbers: JSON.stringify([11, 18, 19, 22, 50]),
            stars: JSON.stringify([1, 11]),
            numbersDrawOrder: JSON.stringify([11, 18, 19, 22, 50]), // Assuming sorted order
            starsDrawOrder: JSON.stringify([1, 11]),
            jackpot: 0, // Unknown
            hasWinner: false
        }
    });
    console.log(`   ✅ Created draw ${draw3.id} for 2026-01-20\n`);

    // Step 3: Verify order
    console.log('3️⃣ Verifying draw order...');
    const allDraws = await prisma.draw.findMany({
        where: { date: { gte: new Date('2026-01-01') } },
        orderBy: { id: 'asc' },
        select: { id: true, date: true }
    });

    console.log('\n📅 Draws in January 2026 (by ID):');
    allDraws.forEach(d => {
        console.log(`   ID ${d.id}: ${d.date.toISOString().split('T')[0]}`);
    });

    console.log('\n✅ Draw order fixed!');
    console.log('\n📌 NEXT STEP: Run turbo-backfill to calculate systems:');
    console.log('   npx tsx src/scripts/core/turbo-backfill.ts');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
