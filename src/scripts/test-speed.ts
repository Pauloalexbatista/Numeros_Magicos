import { prisma } from '../lib/prisma';
import { evaluateDraw, updateRanking } from '../services/ranking';

const BATCH_SIZE = 1;

async function main() {
    console.log('⏱️  Starting Speed Test (10 draws)...');
    const startTime = Date.now();

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
            console.log('✅ No draws to process. System is up to date.');
            return;
        }

        console.log(`📦 Processing ${missingDraws.length} draws...`);

        // 2. Process batch
        for (const drawRaw of missingDraws) {
            process.stdout.write(`.`);
            await evaluateDraw(drawRaw.id);
        }
        console.log(' Done.');

        // 3. Update Rankings
        await updateRanking();

        const endTime = Date.now();
        const duration = (endTime - startTime) / 1000;

        console.log(`\n✅ Finished in ${duration.toFixed(2)} seconds!`);
        console.log(`🚀 Average per draw: ${(duration / missingDraws.length).toFixed(2)}s`);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
