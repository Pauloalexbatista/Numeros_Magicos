import { prisma } from '../../lib/prisma';
import { evaluateDraw, evaluateDrawStars, updateRanking, updateStarRankings, cachePredictions, initializeSystems } from '../../services/ranking';
import { processInBatches } from '../../utils/batch-processor';

// Simple Arg Parser
const args = process.argv.slice(2);
const daysArg = args.find(a => a.startsWith('--days='))?.split('=')[1] || '60';
const gameArg = args.find(a => a.startsWith('--game='))?.split('=')[1];

async function main() {
    const days = parseInt(daysArg, 10);
    console.log('====================================================');
    console.log('🔄 SMART RECALCULATOR (RECENT HISTORY REBUILD)');
    console.log('====================================================');
    console.log(`⏱️  Recalculating last ${days} days of history...`);
    if (gameArg) console.log(`🎮 Target Game: ${gameArg}`);

    await initializeSystems();

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const whereClause: any = {
        date: { gte: cutoffDate }
    };
    if (gameArg) whereClause.game = gameArg;

    const recentDraws = await prisma.draw.findMany({
        where: whereClause,
        orderBy: { date: 'asc' } // Must process strictly from oldest to newest!
    });

    if (recentDraws.length === 0) {
        console.log('❌ No draws found in this period.');
        process.exit(0);
    }

    console.log(`📚 Found ${recentDraws.length} draws from ${cutoffDate.toISOString().split('T')[0]} to today.`);
    console.log('🗑️   Deleting corrupted future performances for these draws...');

    const drawIds = recentDraws.map(d => d.id);

    await prisma.systemPerformance.deleteMany({
        where: { drawId: { in: drawIds } }
    });
    
    await prisma.starSystemPerformance.deleteMany({
        where: { drawId: { in: drawIds } }
    });

    console.log('⚙️   Re-evaluating draws sequentially...');

    await processInBatches(
        recentDraws,
        1, // Process 1 by 1 sequentially to ensure historical accuracy
        async (draw) => {
            console.log(`   -> Evaluating Draw ${draw.game} [${draw.date.toISOString().split('T')[0]}]`);
            await evaluateDraw(draw.id);
            await evaluateDrawStars(draw.id);
        },
        (processed, total) => {
            if (processed % 10 === 0) console.log(`   [Progress]: ${processed}/${total} draws done.`);
        },
        0
    );

    console.log('📈 Updating Rankings (Main + Stars)...');
    await updateRanking();

    console.log('🔮 Re-caching Predictions...');
    await cachePredictions();

    console.log('====================================================');
    console.log('✅ Surgical Rebuild Complete!');
    console.log('====================================================');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
