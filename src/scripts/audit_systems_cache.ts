
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listSystems() {
    console.log("🧩 AUDIT DE SISTEMAS E CACHE\n");

    const activeSystems = await prisma.rankedSystem.findMany({
        where: { isActive: true },
        orderBy: [{ game: 'asc' }, { domain: 'asc' }, { name: 'asc' }]
    });

    console.log("--- Sistemas Ativos no Banco ---");
    console.table(activeSystems.map(s => ({ game: s.game, domain: s.domain, name: s.name })));

    const cached = await prisma.cachedPrediction.findMany({
        orderBy: { systemName: 'asc' }
    });

    console.log("\n--- Previsões em Cache (Próximo Sorteio) ---");
    console.table(cached.map(c => ({ name: c.systemName })));

    const orphans = cached.filter(c => !activeSystems.some(s => s.name === c.name));
    if (orphans.length > 0) {
        console.log("\n⚠️ ORPHANS (Cache sem sistema ativo):");
        console.table(orphans);
    }

    await prisma.$disconnect();
}

listSystems().catch(console.error);
