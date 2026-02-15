
import { PrismaClient } from '@prisma/client';
import {
    evaluateDraw,
    evaluateDrawStars,
    updateRanking,
    updateStarRankings,
    cachePredictions
} from '../services/ranking';

const prisma = new PrismaClient();

async function recalcGranular(game: string, domain: 'NUMBERS' | 'STARS') {
    console.log(`\n🚀 STARTING REBUILD FOR: ${game} (${domain})`);

    // 1. Get Draws
    const draws = await prisma.draw.findMany({
        where: { game: game },
        orderBy: { date: 'asc' } // Process chronological
    });

    if (draws.length === 0) {
        console.error(`❌ No draws found for ${game}`);
        return;
    }

    // Start index (need history to predict)
    const START_INDEX = 50;
    const drawsToProcess = draws.slice(START_INDEX);

    console.log(`   📚 Draws to process: ${drawsToProcess.length} (Total: ${draws.length})`);

    // 2. Process Batch
    console.log(`\n   ⚙️ Processing History...`);
    let processed = 0;
    const total = drawsToProcess.length;

    for (const draw of drawsToProcess) {
        processed++;
        // Log progress every 10 draws
        if (processed % 10 === 0) {
            process.stdout.write(`\r      ⏳ Draw ${draw.id} (${processed}/${total})...`);
        }

        try {
            if (domain === 'NUMBERS') {
                // Evaluate all active NUMBER systems for this draw
                await evaluateDraw(draw.id, { domain: 'NUMBERS' });
            } else {
                // Evaluate all active STAR systems for this draw
                await evaluateDrawStars(draw.id);
            }
        } catch (error: any) { // Explicitly type error as 'any' or 'unknown'
            console.error(`\n      ❌ Error processing draw ${draw.id}:`, error.message);
        }
    }
    console.log(`\n      ✅ History processing complete.`);

    // 3. Update Rankings
    console.log(`\n   📊 Updating Rankings...`);
    if (domain === 'NUMBERS') {
        await updateRanking();
    } else {
        await updateStarRankings();
    }
    console.log(`      ✅ Rankings Updated.`);

    // 4. Cache Next Prediction
    // Note: cachePredictions() in ranking.ts does ALL systems.
    // We can't easily filter it without modifying ranking.ts.
    // But it's fine, it just overwrites.
    // However, it might be slow if we only wanted one game.
    // Let's rely on the global cache update for now or skipping it here
    // and letting the user know "Next Draw" will be generated at the end.
    // Actually, let's call it. It's safe.
    console.log(`\n   🔮 Generating Next Draw Predictions (Global)...`);
    // await cachePredictions();
    // Commented out because cachePredictions runs ALL systems for ALL games
    // which effectively runs the heavy "future prediction" for everything.
    // Code below manually generates cache only for this game/domain if possible?
    // No, easy way: just let the user know.
    // Or we can invoke it. It's 54 systems x 1 prediction. Fast.
    await cachePredictions();

    console.log(`\n✅ COMPLETED: ${game} ${domain}`);
}

// CLI Argument Parsing
const args = process.argv.slice(2);
const targetGame = args[0];
const targetDomain = args[1] as 'NUMBERS' | 'STARS';

if (!targetGame || !targetDomain) {
    console.error("Usage: npx tsx src/scripts/recalc-granular.ts <GAME> <DOMAIN>");
    process.exit(1);
}

recalcGranular(targetGame, targetDomain)
    .catch(console.error)
    .finally(() => prisma.$disconnect());
