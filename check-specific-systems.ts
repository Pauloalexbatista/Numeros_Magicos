
import { PrismaClient } from '@prisma/client';


process.env.DATABASE_URL = "file:./prisma/dev.db";
const prisma = new PrismaClient();

async function main() {
    const systemsToCheck = [
        'Markov Chain',
        'Anti-Markov Chain',
        'Sistema Prata',
        'Anti-Sistema Prata',
        'Machine Learning (Regressão Logística)',
        'Anti-Machine Learning (Regressão Logística)',
        'Random Forest AI',
        'Anti-Random Forest AI',
        'Consensus Auto (Vortex + Camadas + Media3)'
    ];

    console.log('--- Checking Prediction Counts ---');
    for (const name of systemsToCheck) {
        const count = await prisma.systemPrediction.count({
            where: { systemName: name }
        });
        console.log(`${name}: ${count} predictions`);
    }
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
