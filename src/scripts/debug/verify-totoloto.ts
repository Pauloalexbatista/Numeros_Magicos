
import { prisma } from '@/lib/prisma';

async function main() {
    const draw = await prisma.draw.findFirst({
        where: { game: 'TOTOLOTO' },
        orderBy: { date: 'desc' }
    });

    if (!draw) {
        console.log("No Totoloto draws found.");
        return;
    }

    console.log("Latest Totoloto Draw:");
    console.log(`Date: ${draw.date.toISOString().split('T')[0]}`);
    console.log(`Numbers: ${draw.numbers}`);
    console.log(`Lucky Number: ${draw.stars}`);
    console.log(`Jackpot: ${draw.jackpot}`);
}

main().catch(console.error);
