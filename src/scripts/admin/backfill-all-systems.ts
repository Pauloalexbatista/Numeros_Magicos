
import { prisma } from '../../lib/prisma';
import { EuroMillionsService } from '../../services/euroMillionsService';
import { TotolotoService } from '../../services/totolotoService';
import { EuroDreamsService } from '../../services/euroDreamsService';
import { evaluateDraw, evaluateDrawStars, updateRanking, cachePredictions } from '../../services/ranking';
import { processInBatches } from '../../utils/batch-processor';

async function main() {
    console.log('🚀 STARTING GLOBAL BACKFILL & SYNC...');

    const emService = new EuroMillionsService();
    const tlService = new TotolotoService();
    const edService = new EuroDreamsService();

    // 1. SYNC MISSING DRAWS
    console.log('\n--- PHASE 1: SYNCING DRAWS ---');
    await emService.updateDatabase(); // EM has built-in sync
    await tlService.updateDatabase(); // Now has syncMissingDraws
    await edService.updateDatabase(); // Now has syncMissingDraws

    // 2. BACKFILL PERFORMANCES
    console.log('\n--- PHASE 2: EVALUATING ALL DRAWS ---');
    
    const games = ['EUROMILLIONS', 'TOTOLOTO', 'EURODREAMS'];

    for (const game of games) {
        console.log(`\nProcessing ${game}...`);
        
        const draws = await prisma.draw.findMany({
            where: { game },
            orderBy: { date: 'asc' }
        });

        console.log(`Found ${draws.length} draws in database for ${game}`);

        await processInBatches(
            draws,
            20,
            async (draw) => {
                try {
                    // This will now calculate for ALL systems (the new logic handles filters)
                    await evaluateDraw(draw.id);
                    await evaluateDrawStars(draw.id);
                } catch (err) {
                    console.error(`Error on draw ${draw.id}:`, err);
                }
            },
            (done, total) => {
                if (done % 100 === 0) console.log(`  Progress: ${done}/${total}`);
            }
        );
    }

    // 3. FINAL RANKINGS
    console.log('\n--- PHASE 3: FINAL UPDATES ---');
    console.log('Updating all rankings...');
    await updateRanking();
    
    console.log('Regenerating cached predictions...');
    await cachePredictions();

    console.log('\n✅ GLOBAL BACKFILL COMPLETE!');
}

main().catch(err => {
    console.error('CRITICAL FAILURE:', err);
    process.exit(1);
});
