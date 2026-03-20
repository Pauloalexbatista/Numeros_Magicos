import { prisma } from './src/lib/prisma';
async function main() {
    const dates = [
        '2011-07-08T12:00:00Z',
        '2011-07-12T12:00:00Z',
        '2011-07-15T12:00:00Z'
    ];
    for (const datestr of dates) {
        const d = await prisma.draw.findFirst({ where: { game: 'EUROMILLIONS', date: new Date(datestr) } });
        console.log(`EUROMILLIONS ${datestr.split('T')[0]}: N ${d?.numbers} S ${d?.stars}`);
        const t = await prisma.draw.findFirst({ where: { game: 'TOTOLOTO', date: new Date(datestr) } });
        console.log(`TOTOLOTO     ${datestr.split('T')[0]}: N ${t?.numbers} S ${t?.stars}`);
        console.log('---');
    }
}
main().finally(() => prisma.$disconnect());
