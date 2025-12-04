import { prisma } from '../lib/prisma';

async function main() {
    const totalDraws = await prisma.draw.count();

    // Count how many draws have a performance record for 'Sistema Ouro'
    // This indicates they have been processed by the backfill
    const processedDraws = await prisma.systemPerformance.count({
        where: { systemName: 'Sistema Ouro' }
    });

    const remaining = totalDraws - processedDraws;
    const percentage = ((processedDraws / totalDraws) * 100).toFixed(1);

    console.log(`📊 Backfill Progress:`);
    console.log(`✅ Processed: ${processedDraws} / ${totalDraws}`);
    console.log(`⏳ Remaining: ${remaining}`);
    console.log(`📈 Completion: ${percentage}%`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
