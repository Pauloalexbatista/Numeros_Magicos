
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log("📊 Counting Active Systems...");

    const systems = await prisma.rankedSystem.findMany({
        where: { isActive: true }
    });

    const euroMillionsNumbers = systems.filter(s => s.game === 'EUROMILLIONS' && s.domain === 'NUMBERS');
    const euroMillionsStars = systems.filter(s => s.game === 'EUROMILLIONS' && s.domain === 'STARS');

    console.log(`\n🇪🇺 EUROMILLIONS:`);
    console.log(`   🔢 Number Systems: ${euroMillionsNumbers.length}`);
    console.log(`   ⭐ Star Systems: ${euroMillionsStars.length}`);
    console.log(`   📝 Total: ${euroMillionsNumbers.length + euroMillionsStars.length}`);

    console.log("\n--- Number Systems ---");
    euroMillionsNumbers.forEach(s => console.log(` - ${s.name}`));

    console.log("\n--- Star Systems ---");
    euroMillionsStars.forEach(s => console.log(` - ${s.name}`));

}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
