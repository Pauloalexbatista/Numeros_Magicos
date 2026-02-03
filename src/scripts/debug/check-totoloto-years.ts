
import { prisma } from '@/lib/prisma';

async function main() {
    console.log('📊 Analyzing Totoloto Draws per Year...');

    const draws = await prisma.draw.findMany({
        where: { game: 'TOTOLOTO' },
        select: { date: true }
    });

    const years: Record<string, number> = {};
    let minDate: Date | null = null;
    let maxDate: Date | null = null;

    for (const draw of draws) {
        const year = draw.date.getFullYear().toString();
        years[year] = (years[year] || 0) + 1;

        if (!minDate || draw.date < minDate) minDate = draw.date;
        if (!maxDate || draw.date > maxDate) maxDate = draw.date;
    }

    console.log('\n📅 Draws per Year:');
    Object.keys(years).sort().forEach(year => {
        const count = years[year];
        const status = count >= 100 ? '✅' : '⚠️';
        console.log(`${year}: ${count} draws ${status}`);
    });

    console.log(`\nTypical Totoloto year (Wed+Sat) should have ~104 draws.`);
    console.log(`Total Stored: ${draws.length}`);
    if (minDate && maxDate) {
        console.log(`Range: ${minDate.toISOString().split('T')[0]} to ${maxDate.toISOString().split('T')[0]}`);
    }
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
