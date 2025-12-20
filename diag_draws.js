const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const draws = await prisma.draw.findMany({
            orderBy: { date: 'desc' },
            take: 20
        });

        console.log('--- RECENT DRAWS CHECK ---');
        draws.forEach(d => {
            let n = [];
            let s = [];
            try {
                n = JSON.parse(d.numbers);
                s = JSON.parse(d.stars);
            } catch (e) {
                console.log(`ERROR PARSING draw ID ${d.id} date ${d.date}: ${e.message}`);
            }
            console.log(`ID: ${d.id} | Date: ${d.date.toISOString()} | N: ${n.length} | S: ${s.length} | Jackpot: ${d.jackpot}`);
        });
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
