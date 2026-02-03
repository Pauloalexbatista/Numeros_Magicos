
import { prisma } from '../lib/prisma';

async function main() {
    const count = await prisma.draw.count({
        where: {
            game: 'TOTOLOTO',
            date: {
                gte: new Date('2023-01-01'),
                lte: new Date('2023-12-31')
            }
        }
    });
    console.log(`Totoloto 2023 Draws Importados: ${count}`);

    // Check if we hit roughly 104 draws (2 per week * 52 weeks)
    // 2023 has 52 weeks, so 104 or 105 draws.

    const draws = await prisma.draw.findMany({
        where: {
            game: 'TOTOLOTO',
            date: {
                gte: new Date('2023-01-01'),
                lte: new Date('2023-12-31')
            }
        },
        select: { date: true },
        orderBy: { date: 'desc' },
        take: 1
    });

    if (draws.length > 0) console.log(`Last 2023 draw: ${draws[0].date.toISOString().split('T')[0]}`);
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
