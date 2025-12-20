
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const lastDraw = await prisma.draw.findFirst({ orderBy: { id: 'desc' } });
    console.log('Last Draw ID:', lastDraw?.id);

    const nextDrawId = (lastDraw?.id || 0) + 1;
    console.log('Next Draw ID:', nextDrawId);

    const count = await prisma.systemPrediction.count({
        where: { drawId: nextDrawId }
    });
    console.log('Predictions for Next Draw:', count);

    if (count > 0) {
        const examples = await prisma.systemPrediction.findMany({
            where: { drawId: nextDrawId },
            take: 3,
            select: { systemName: true, prediction: true }
        });
        console.log('Sample predictions:', examples);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
