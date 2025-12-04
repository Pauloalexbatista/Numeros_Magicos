import { prisma } from '../lib/prisma';
import { evaluateDraw, updateRanking, cachePredictions } from '../services/ranking';

const BATCH_SIZE = 10;
const WAIT_MS = 5000;

async function main() {
    console.log('🚀 Starting Auto-Backfill Loop...');
    console.log('Press Ctrl+C to stop at any time.');

    while (true) {
        try {
            // 1. Find missing draws
            const missingDraws = await prisma.$queryRaw<{ id: number, date: string }[]>`
                SELECT d.id, d.date 
                FROM Draw d
                WHERE NOT EXISTS (
                    SELECT 1 FROM system_performance sp 
                    WHERE sp.drawId = d.id 
                    AND sp.systemName = 'Sistema Ouro'
                )
                ORDER BY d.date ASC
                LIMIT ${BATCH_SIZE}
            `;

            if (missingDraws.length === 0) {
                console.log('✅ All draws processed! Running final optimizations...');

                console.log('🔄 Updating Rankings...');
                await updateRanking();

                console.log('💾 Caching Future Predictions...');
                await cachePredictions();

                console.log('🎉 DONE! You can close this window.');
                break;
            }

            console.log(`\n📦 Processing batch of ${missingDraws.length} draws...`);

            // 2. Process batch
            for (const drawRaw of missingDraws) {
                process.stdout.write(`.`);
                await evaluateDraw(drawRaw.id);
            }
            console.log(' Done.');

            // 3. Update Rankings (keep UI live)
            await updateRanking();

            // 4. Wait
            console.log(`⏳ Waiting ${WAIT_MS / 1000}s before next batch...`);
            await new Promise(resolve => setTimeout(resolve, WAIT_MS));

        } catch (error) {
            console.error('❌ Error in loop:', error);
            console.log('Retrying in 10 seconds...');
            await new Promise(resolve => setTimeout(resolve, 10000));
        }
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
