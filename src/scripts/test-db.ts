
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: 'file:./prisma/dev.db',
        },
    },
});

async function main() {
    console.log('Testing DB Access (Explicit URL)...');
    const count = await prisma.draw.count();
    console.log(`✅ Success! Found ${count} draws.`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
