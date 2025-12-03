
import { trainAllModels } from '../services/ml/turboTraining';
import { prisma } from '@/lib/prisma';

async function main() {
    await trainAllModels();
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
