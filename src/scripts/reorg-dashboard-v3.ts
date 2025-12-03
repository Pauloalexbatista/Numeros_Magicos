import { prisma } from '../lib/prisma';

async function main() {
    console.log('🔄 Reorganizing Dashboard (v3)...');

    // 1. Widen "Top Sistemas" to 3 cols
    const topSys = await prisma.dashboardCard.updateMany({
        where: { title: 'Top Sistemas' },
        data: { gridSpan: 3 }
    });
    console.log(`   Widened "Top Sistemas" to 3 cols: ${topSys.count} cards.`);

    // 2. Widen "Top Sistemas Estrelas" to 3 cols
    const topStars = await prisma.dashboardCard.updateMany({
        where: { title: 'Top Sistemas Estrelas' },
        data: { gridSpan: 3 }
    });
    console.log(`   Widened "Top Sistemas Estrelas" to 3 cols: ${topStars.count} cards.`);

    console.log('✅ Dashboard Reorganization Complete.');
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
