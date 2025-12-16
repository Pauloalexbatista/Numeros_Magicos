
import { updateRanking } from '../services/ranking';
import { prisma } from '../lib/prisma';

async function main() {
    console.log('🔄 Forcing Ranking Update...');

    // Clean up old system name to avoid duplicates/confusion
    await prisma.systemRanking.deleteMany({
        where: { systemName: 'Consensus Auto (Vortex + LSTM + Media3)' }
    });
    console.log('🧹 Cleaned up old Consensus System name.');

    await updateRanking();
    console.log('✅ Done.');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
