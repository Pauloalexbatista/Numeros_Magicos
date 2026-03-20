import { prisma } from './src/lib/prisma';
async function main() {
    const draws = await prisma.draw.findMany({ where: { game: 'TOTOLOTO' } });
    const wrong = [];
    for (const d of draws) {
        // We know they are stored as noon UTC now, or whatever it is, 
        // to be safe, get local day using the string
        const dateStr = d.date.toISOString().split('T')[0];
        const day = new Date(dateStr + "T12:00:00Z").getUTCDay();
        if (day === 0 || day === 2 || day === 5 || day === 1 || day === 4) {
             const dayName = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][day];
             wrong.push(`${dateStr} (${dayName})`);
        }
    }
    console.log(`Found ${wrong.length} Totoloto draws on weird days:`);
    console.log(wrong.slice(0, 30).join('\n'));
}
main().finally(()=>prisma.$disconnect());
