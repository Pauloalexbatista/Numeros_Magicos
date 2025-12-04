import { prisma } from '../lib/prisma';

async function main() {
    console.log('🔄 Reorganizing Dashboard...');

    // 1. Move "Previsões de Estrelas" to ADMIN
    const starPred = await prisma.dashboardCard.updateMany({
        where: { componentKey: 'StarPredictionWidget' },
        data: { minRole: 'ADMIN' }
    });
    console.log(`   Moved "Previsões de Estrelas" to ADMIN: ${starPred.count} cards.`);

    // 2. Widen "Top Sistemas"
    const topSys = await prisma.dashboardCard.updateMany({
        where: { title: 'Top Sistemas' },
        data: { gridSpan: 2 }
    });
    console.log(`   Widened "Top Sistemas" to 2 cols: ${topSys.count} cards.`);

    // 3. Widen "Top Estrelas"
    const topStars = await prisma.dashboardCard.updateMany({
        where: { title: 'Top Estrelas' },
        data: { gridSpan: 2 }
    });
    console.log(`   Widened "Top Estrelas" to 2 cols: ${topStars.count} cards.`);

    console.log('✅ Dashboard Reorganization Complete.');
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
