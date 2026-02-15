
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log("🚫 DEACTIVATING RANDOM SYSTEMS...");

    const systemsToDisable = [
        'Random Generator',
        'Monte Carlo',
        'Random Stars',
        'Monte Carlo Stars'
    ];

    for (const name of systemsToDisable) {
        try {
            const result = await prisma.rankedSystem.updateMany({
                where: { name: { contains: name } }, // Use contains to catch variations
                data: { isActive: false }
            });
            console.log(`Updated ${result.count} systems matching "${name}" to isActive=false`);
        } catch (error) {
            console.log(`Could not update ${name} (maybe not found):`, error.message);
        }
    }

    console.log("✅ Random systems deactivated in DB.");
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
