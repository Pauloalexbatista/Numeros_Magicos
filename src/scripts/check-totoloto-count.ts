
import { prisma } from '../lib/prisma';

async function main() {
    const count = await prisma.draw.count({
        where: { game: 'TOTOLOTO' }
    });

    const first = await prisma.draw.findFirst({
        where: { game: 'TOTOLOTO' },
        orderBy: { date: 'asc' }
    });

    const last = await prisma.draw.findFirst({
        where: { game: 'TOTOLOTO' },
        orderBy: { date: 'desc' }
    });

    console.log(`\n📊 TOTOLOTO STATUS:`);
    console.log(`   Count: ${count}`);
    if (first) console.log(`   First: ${first.date.toISOString().split('T')[0]}`);
    if (last) console.log(`   Last:  ${last.date.toISOString().split('T')[0]}`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
