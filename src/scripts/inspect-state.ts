import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Dashboard Cards ---');
    const cards = await prisma.dashboardCard.findMany({
        orderBy: { order: 'asc' }
    });
    console.table(cards.map(c => ({
        id: c.id,
        title: c.title,
        component: c.componentKey,
        order: c.order,
        active: c.isActive
    })));

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
            console.log(`Draw Date: ${p.draw.date.toISOString().split('T')[0]}`);
            const drawNumbers = JSON.parse(p.draw.numbers) as number[];
            const predicted = JSON.parse(p.predictedNumbers) as number[];
            console.log(`Draw Numbers: ${drawNumbers.join(', ')}`);
            console.log(`Predicted: ${predicted.join(', ')}`);
            console.log(`Matches: ${p.hits}`);
            console.log('---');
        });
    }
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
