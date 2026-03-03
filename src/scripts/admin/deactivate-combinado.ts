
import { prisma } from '../../lib/prisma';
import { prismaProd } from '../../lib/prisma-prod';

async function deactivateRemaining() {
    console.log('🧹 Deactivating Remaining Systems (Local & Prod)...');

    const patterns = ['Combinado', 'Consensus', 'Medalha', 'Neuronal', 'Vortex Multi'];

    // 1. Local
    const localUpdate = await prisma.rankedSystem.updateMany({
        where: {
            OR: patterns.map(p => ({ name: { contains: p } })),
            isActive: true
        },
        data: { isActive: false }
    });
    console.log(`✅ [LOCAL] Deactivated ${localUpdate.count} systems.`);

    // 2. Prod
    const prod = prismaProd as any;
    const prodUpdate = await prod.rankedSystem.updateMany({
        where: {
            OR: patterns.map(p => ({ name: { contains: p } })),
            isActive: true
        },
        data: { isActive: false }
    });
    console.log(`✅ [PROD] Deactivated ${prodUpdate.count} systems.`);
}

deactivateRemaining()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
        await (prismaProd as any).$disconnect();
    });
