
import { prisma } from './src/lib/prisma';

const starSystems = [
    "Hot Stars",
    "Late Stars",
    "Markov Stars",
    "Star Platinum",
    "Anti-Hot Stars",
    "Anti-Late Stars",
    "Golden Pair"
];

async function seedStarSystems() {
    console.log("Seeding Star Systems into RankedSystem...");

    for (const name of starSystems) {
        try {
            await prisma.rankedSystem.upsert({
                where: { name },
                update: {},
                create: {
                    name,
                    description: `System for predicting stars: ${name}`,
                    isActive: true
                }
            });
            console.log(`✅ Upserted: ${name}`);
        } catch (e) {
            console.error(`❌ Failed to upsert ${name}:`, e);
        }
    }
}

seedStarSystems()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
