
import { prisma } from '../lib/prisma';

async function main() {
    const totalDraws = await prisma.draw.count();
    const totalPerformance = await prisma.systemPerformance.count();
    const processedDraws = await prisma.draw.count({
        where: {
            systemPerformances: {
                some: {}
            }
        }
    });

    console.log(`Total Draws: ${totalDraws}`);
    console.log(`Total Performance Records: ${totalPerformance}`);
    console.log(`Draws with Performance Data: ${processedDraws} / ${totalDraws}`);
    console.log(`Progress: ${((processedDraws / totalDraws) * 100).toFixed(2)}%`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
