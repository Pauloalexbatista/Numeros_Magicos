import { prisma } from './src/lib/prisma';
async function main() {
    const draws = await prisma.draw.findMany({ where: { game: 'TOTOLOTO' }, orderBy: { date: 'asc' } });
    const wrong = [];
    for (const d of draws) {
        const dateStr = d.date.toISOString().split('T')[0];
        const day = new Date(dateStr + "T12:00:00Z").getUTCDay();
        if (day === 2 || day === 5) {
            wrong.push({ date: dateStr, N: d.numbers, S: d.stars });
        }
    }
    console.log(`Initial ${wrong.length} wrong draws:`);
    console.log(wrong.slice(0, 10));
}
main().finally(()=>prisma.$disconnect());
