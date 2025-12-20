
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Deleting Quarteto de Impacto from database...');
    const deleteResult = await prisma.systemPerformance.deleteMany({
        where: {
            systemName: {
                contains: 'Quarteto de Impacto'
            }
        }
    });
    console.log(`Deleted ${deleteResult.count} records from SystemPerformance.`);

    // Also check for anti-systems if any
    const deleteAnti = await prisma.systemPerformance.deleteMany({
        where: {
            systemName: {
                contains: 'Anti-Quarteto de Impacto'
            }
        }
    });
    console.log(`Deleted ${deleteAnti.count} anti-system records.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
