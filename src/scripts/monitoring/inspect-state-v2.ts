import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('\n--- Ranking Data Analysis ---');
    const performances = await prisma.systemPerformance.findMany({
        take: 5,
        include: {
            draw: true,
            system: true
        },
        orderBy: { draw: { date: 'desc' } }
    });

    if (performances.length === 0) {
        console.log('No performance data found.');
    } else {
        console.log('Sample Performance Entries:');
        performances.forEach(p => {
            console.log(`System: ${p.system.name}`);
            console.log(`Draw Date: ${p.draw.date}`);
            // Handle numbers safely
            const numbers = p.draw.numbers;
            console.log(`Draw Numbers (${typeof numbers}):`, numbers);
            console.log(`Predicted:`, p.predictedNumbers);
            console.log(`Matches: ${p.hits}`);
            console.log('---');
        });
    }
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
