const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Starting cleanup...');

        // 1. Delete Performance Records (SystemPerformance)
        const perf = await prisma.systemPerformance.deleteMany({
            where: {
                OR: [
                    { systemName: { contains: 'Quarteto de Impacto' } },
                    { systemName: { contains: 'Anti-Quarteto de Impacto' } }
                ]
            }
        });
        console.log(`Deleted ${perf.count} performance records.`);

        // 2. Delete Staging Records (SystemPerformanceStaging)
        const staging = await prisma.systemPerformanceStaging.deleteMany({
            where: {
                OR: [
                    { systemName: { contains: 'Quarteto de Impacto' } },
                    { systemName: { contains: 'Anti-Quarteto de Impacto' } }
                ]
            }
        });
        console.log(`Deleted ${staging.count} staging records.`);

        // 3. Delete from RankedSystem registry
        const ranked = await prisma.rankedSystem.deleteMany({
            where: {
                OR: [
                    { name: { contains: 'Quarteto de Impacto' } },
                    { name: { contains: 'Anti-Quarteto de Impacto' } }
                ]
            }
        });
        console.log(`Deleted ${ranked.count} systems from registry.`);

    } catch (e) {
        console.error('Error during cleanup:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
