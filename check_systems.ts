
import { prisma } from './src/lib/prisma';

async function checkSystems() {
    const starSystems = [
        "Golden Pair",
        "Hot Pair",
        "Rational Pair",
        "Star Frequency",
        "Star Pattern"
    ]; // Common names I suspect

    console.log("Checking RankedSystem table...");
    const systems = await prisma.rankedSystem.findMany({
        where: {
            name: { in: starSystems }
        }
    });

    console.log("Found systems:", systems);

    const all = await prisma.rankedSystem.findMany({ select: { name: true } });
    console.log("All Ranked Systems:", all.map(s => s.name));
}

checkSystems()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
