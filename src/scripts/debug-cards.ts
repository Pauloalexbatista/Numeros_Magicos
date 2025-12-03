import { prisma } from '../lib/prisma';

async function main() {
    const cards = await prisma.dashboardCard.findMany({
        orderBy: { order: 'asc' }
    });

    console.log('--- Current Cards ---');
    cards.forEach(c => {
        console.log(`[${c.id}] Title: "${c.title}" | Key: ${c.componentKey} | Span: ${c.gridSpan} | Role: ${c.minRole}`);
    });
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
