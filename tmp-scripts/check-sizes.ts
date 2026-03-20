import { prisma } from './src/lib/prisma';
async function main() {
    const draws = await prisma.draw.findMany({ where: { game: 'TOTOLOTO' } });
    const badSizes = draws.filter(d => JSON.parse(d.numbers).length !== 5);
    console.log('Totoloto draws with != 5 main numbers:', badSizes.length);
    if (badSizes.length > 0) {
        console.log('Sample bad draws:');
        badSizes.slice(0, 5).forEach(d => {
            console.log(d.date.toISOString().split('T')[0], 'Numbers:', d.numbers, 'Stars:', d.stars);
        });
    }
}
main().finally(() => prisma.$disconnect());
