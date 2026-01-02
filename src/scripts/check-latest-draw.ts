
import { prisma } from '../lib/prisma';

async function main() {
    const latestDraw = await prisma.draw.findFirst({
        orderBy: { date: 'desc' }
    });
    console.log("LATEST DRAW:", latestDraw?.date, latestDraw?.id);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
