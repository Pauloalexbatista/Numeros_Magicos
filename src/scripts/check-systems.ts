import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const systems = await prisma.rankedSystem.findMany({
        where: { isActive: true },
        select: { name: true }
    });
    console.log(JSON.stringify(systems.map(s => s.name), null, 2));
}
main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
