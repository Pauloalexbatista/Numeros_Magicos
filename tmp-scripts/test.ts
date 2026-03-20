import { prisma } from './src/lib/prisma';
async function test() {
    const d = await prisma.draw.findFirst({
        where: { game: 'TOTOLOTO', date: { gt: new Date('2024-04-01') } }
    });
    console.log('Date from DB:', d?.date);
    console.log('ISO String:', d?.date.toISOString());
    console.log('getDay() ->', d?.date.getDay());
    console.log('getUTCDay() ->', d?.date.getUTCDay());
}
test().then(() => prisma.$disconnect());
