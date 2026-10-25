import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();

async function purgeFuzzy() {
    const preds = await p.systemPrediction.deleteMany({
        where: { systemName: { contains: 'Atrasad' } }
    });
    console.log(`Fuzzy deleted predictions: ${preds.count}`);

    const ranks = await p.systemRanking.deleteMany({
        where: { systemName: { contains: 'Atrasad' } }
    });
    console.log(`Fuzzy deleted rankings: ${ranks.count}`);
}

purgeFuzzy().finally(() => p.$disconnect());
