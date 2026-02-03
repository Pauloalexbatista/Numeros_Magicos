
import { prisma } from '../lib/prisma';

async function main() {
    console.log("Counting draws per year...");
    const games = ['EUROMILLIONS', 'TOTOLOTO', 'EURODREAMS'];

    for (const game of games) {
        const draws = await prisma.draw.findMany({
            where: { game },
            select: { date: true }
        });

        const byYear: Record<string, number> = {};
        draws.forEach(d => {
            const y = d.date.toISOString().split('T')[0].split('-')[0]; // Use ISO date to avoid local time shifts
            byYear[y] = (byYear[y] || 0) + 1;
        });

        console.log(`\n=== ${game} ===`);
        const years = Object.keys(byYear).sort();
        if (years.length === 0) {
            console.log("No data.");
        } else {
            for (const y of years) {
                console.log(`${y}: ${byYear[y]} draws`);
            }
        }
    }
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
