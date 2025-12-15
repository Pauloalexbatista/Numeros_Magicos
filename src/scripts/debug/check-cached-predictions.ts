
import { prisma } from '../../lib/prisma';

async function checkCache() {
    const systemsToCheck = ['Random Generator', 'Sistema Média Camadas', 'LSTM Neural Net', 'Gold System'];

    console.log("Checking CachedPrediction table...");

    for (const sys of systemsToCheck) {
        const cached = await prisma.cachedPrediction.findUnique({
            where: { systemName: sys }
        });

        if (cached) {
            console.log(`✅ ${sys}: Found (Updated: ${cached.updatedAt.toISOString()})`);
            console.log(`   Numbers: ${cached.numbers}`);
        } else {
            console.log(`❌ ${sys}: NOT FOUND in CachedPrediction`);
        }
    }
}

checkCache()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
