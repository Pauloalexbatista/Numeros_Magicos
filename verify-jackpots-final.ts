import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyLSTMJackpots() {
    console.log('🔍 VERIFICAÇÃO FINAL: LSTM Neural Net Jackpots\n');

    // Get ALL performances
    const all = await prisma.systemPerformance.findMany({
        where: { systemName: 'LSTM Neural Net' },
        select: { drawId: true, hits: true, id: true },
        orderBy: { id: 'asc' }
    });

    console.log(`Total de registos na BD: ${all.length}`);

    // Deduplicate
    const seen = new Map<number, { id: number, hits: number }>();

    all.forEach(p => {
        if (!seen.has(p.drawId) || seen.get(p.drawId)!.id < p.id) {
            seen.set(p.drawId, { id: p.id, hits: p.hits });
        }
    });

    console.log(`Draws únicos: ${seen.size}`);

    // Count jackpots
    let jackpots = 0;
    seen.forEach(p => {
        if (p.hits === 5) jackpots++;
    });

    console.log(`\n✅ JACKPOTS (5 acertos) após deduplicação: ${jackpots}`);

    await prisma.$disconnect();
}

verifyLSTMJackpots();
