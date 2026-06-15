const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    // Deactivate all STARS domain systems for MEGASENA
    const r = await prisma.rankedSystem.updateMany({
        where: { game: 'MEGASENA', domain: 'STARS' },
        data: { isActive: false }
    });
    console.log("Stars systems desactivados para MEGASENA:", r.count);

    // Confirm
    const active = await prisma.rankedSystem.findMany({
        where: { game: 'MEGASENA', isActive: true },
        select: { name: true, domain: true }
    });
    const inactive = await prisma.rankedSystem.findMany({
        where: { game: 'MEGASENA', isActive: false },
        select: { name: true, domain: true }
    });
    console.log("\nActivos (" + active.length + "):");
    active.forEach(s => console.log("  [" + s.domain + "] " + s.name));
    console.log("\nDesactivados (" + inactive.length + "):");
    inactive.forEach(s => console.log("  [" + s.domain + "] " + s.name));
    await prisma.$disconnect();
}
main().catch(e => console.error(e.message));
