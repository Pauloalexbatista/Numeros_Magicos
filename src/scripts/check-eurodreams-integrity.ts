
import { prisma } from '../lib/prisma';

async function main() {
    console.log("Checking EuroDreams Integrity (2025 & 2023)...");

    // Check 2024 count (should be ~105 now)
    const count2024 = await prisma.draw.count({
        where: {
            game: 'EURODREAMS',
            date: {
                gte: new Date('2024-01-01'),
                lte: new Date('2024-12-31')
            }
        }
    });
    console.log(`2024 Draws in DB: ${count2024}`);

    // Check 2025 count
    const count2025 = await prisma.draw.count({
        where: {
            game: 'EURODREAMS',
            date: {
                gte: new Date('2025-01-01'),
                lte: new Date('2025-12-31')
            }
        }
    });
    console.log(`2025 Draws in DB: ${count2025}`);

    // Check 2023 count
    const count2023 = await prisma.draw.count({
        where: {
            game: 'EURODREAMS',
            date: {
                gte: new Date('2023-01-01'),
                lte: new Date('2023-12-31')
            }
        }
    });
    console.log(`2023 Draws in DB: ${count2023}`);
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
