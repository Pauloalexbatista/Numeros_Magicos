
import { updateRanking } from '../services/ranking';
import { prisma } from '../lib/prisma';

async function main() {
    console.log('🔄 Forcing Ranking Update...');
    await updateRanking();
    console.log('✅ Done.');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
