
import { prisma } from '../../lib/prisma';

async function checkDate() {
    const sys = await prisma.cachedPrediction.findUnique({
        where: { systemName: 'Anti-Hot Numbers' }
    });

    if (sys) {
        console.log(`Anti-Hot Numbers Updated At: ${sys.updatedAt.toISOString()}`);
        console.log(`Now: ${new Date().toISOString()}`);
    } else {
        console.log('❌ Anti-Hot Numbers NOT FOUND in Cache');
    }
}

checkDate()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
