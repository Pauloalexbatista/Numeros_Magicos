
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: 'file:./prisma/dev.db'
        }
    }
});

async function main() {
    try {
        const count = await prisma.cachedPrediction.count();
        console.log('Cached Predictions Count:', count);

        if (count > 0) {
            const examples = await prisma.cachedPrediction.findMany({
                take: 3,
                select: { systemName: true, numbers: true }
            });
            console.log('Sample cached predictions:', examples);
        }
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
