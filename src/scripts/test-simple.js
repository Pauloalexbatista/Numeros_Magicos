
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: 'file:./prisma/dev.db',
        },
    },
});

async function main() {
    console.log('Running JS Test...');
    try {
        const count = await prisma.draw.count();
        console.log('Count:', count);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
