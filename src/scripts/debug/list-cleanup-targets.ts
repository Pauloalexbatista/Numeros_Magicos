
import { prisma } from '../../lib/prisma';

async function listTargets() {
    const activeSystems = await prisma.rankedSystem.findMany({
        where: { isActive: true }
    });

    const toDeactivate = activeSystems.filter(s =>
        s.name.includes('Consensus') ||
        s.name.includes('Medal') ||
        s.name.includes('Neural') ||
        s.name.includes('LSTM') ||
        s.name.includes('Vortex Multi') // Usually part of the advanced/neural set
    );

    const toDelete = activeSystems.filter(s =>
        s.name.includes('Random') ||
        s.name.includes('Aleatório')
    );

    console.log('--- SYSTEMS TO DEACTIVATE (Turn OFF) ---');
    toDeactivate.forEach(s => console.log(`[${s.game}] ${s.name}`));

    console.log('\n--- SYSTEMS TO DELETE (Random) ---');
    toDelete.forEach(s => console.log(`[${s.game}] ${s.name}`));
}

listTargets()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
