
import { updateStarRankings } from '../../services/ranking';
import { prisma } from '../../lib/prisma';

async function run() {
    console.log('📊 Atualizando Rankings de Estrelas...');
    await updateStarRankings();
    console.log('✅ Concluído!');
}

run().catch(console.error).finally(() => prisma.$disconnect());
