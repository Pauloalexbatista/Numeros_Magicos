const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const systems = await prisma.rankedSystem.findMany({ select: { name: true } });
        console.log('--- RANKED SYSTEMS ---');
        systems.forEach(s => {
            const trimmed = s.name.trim();
            if (trimmed !== s.name) {
                console.log(`MISMATCH: [${s.name}] (length ${s.name.length})`);
            } else {
                console.log(`OK: [${s.name}]`);
            }
        });
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
