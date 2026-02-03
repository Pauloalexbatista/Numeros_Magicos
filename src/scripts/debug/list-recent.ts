
import { prisma } from '@/lib/prisma';

async function main() {
    const draws = await prisma.draw.findMany({
        orderBy: { date: 'desc' },
        take: 5
    });
    console.log("Recent Draws:");
    draws.forEach(d => {
        console.log(`${d.date.toISOString().split('T')[0]} - ${d.numbers} + ${d.stars}`);
    });
}

main();
