const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const systems = await prisma.rankedSystem.findMany();
        systems.forEach(s => {
            console.log(`${s.name} | Active: ${s.isActive}`);
        });
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
