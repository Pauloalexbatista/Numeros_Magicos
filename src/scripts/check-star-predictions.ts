
import { prisma } from '../lib/prisma';

async function main() {
    console.log('Checking Star Systems in DB...');

    const starSystems = await prisma.rankedSystem.findMany({
        where: {
            OR: [
                { name: { contains: 'Star' } },
                { name: { contains: 'Estrela' } }
            ]
        },
        include: {
            cachedPrediction: true
        }
    });

    console.log(`Found ${starSystems.length} star systems.`);

    starSystems.forEach(sys => {
        console.log(`- ${sys.name}: CachedPrediction = ${sys.cachedPrediction ? 'YES' : 'NO'}`);
        if (sys.cachedPrediction) {
            console.log(`  Numbers: ${sys.cachedPrediction.numbers}`);
        }
    });

    const allPredictions = await prisma.cachedPrediction.count();
    console.log(`Total CachedPredictions: ${allPredictions}`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
