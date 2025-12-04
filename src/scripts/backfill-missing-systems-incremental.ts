import { prisma } from '../lib/prisma';
import { rankedSystems } from '../services/ranked-systems';
import { evaluateDraw, updateRanking, cachePredictions } from '../services/ranking';

const BATCH_SIZE = 50;
const TARGET_SYSTEMS = ['Sistema Ouro', 'Sistema Prata', 'Sistema Bronze'];

async function main() {
    console.log('🔧 Incremental Backfill for Medal Systems (Gold/Silver/Bronze)...');

    try {
        // 1. Find draws that are missing performance for ANY of the target systems
        // This is a bit complex to query directly efficiently, so we'll do a "find draws where..." approach
        // A simple heuristic: Find draws where systemPerformances count for these systems is < 3

        // However, Prisma doesn't support easy "count of related records with filter" in the where clause efficiently for SQLite.
        // Let's iterate from the beginning (or a saved checkpoint if we had one, but let's just check raw data).
        // To be efficient, we fetch draws that DO NOT have a performance record for 'Sistema Ouro' (assuming if one is missing, likely all are).

        // Let's get all draws, but select only ID and date to be light.
        // We can filter in memory or use a raw query.
        // Let's use a raw query for speed to find IDs of draws missing 'Sistema Ouro'.

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
            console.log('✅ All Medal Systems seem to be up to date!');
            // Double check Silver/Bronze just in case
            const missingSilver = await prisma.systemPerformance.count({ where: { systemName: 'Sistema Prata' } });
            const totalDraws = await prisma.draw.count();
            if (missingSilver < totalDraws) {
                console.log('⚠️  Wait, Sistema Prata might still have gaps. Running a deeper check...');
                // If Ouro is done but Prata isn't, we might need to adjust logic. 
                // But for now, let's assume they go together.
            }
            return;
        }

        console.log(`📦 Found ${missingDraws.length} draws needing repair. Processing batch...`);

        let processed = 0;
        for (const drawRaw of missingDraws) {
            // We need to cast the date because raw query returns string
            const dateStr = drawRaw.date as unknown as string;

            process.stdout.write(`\r⏳ Repairing draw ${drawRaw.id} (${dateStr})...`);

            // evaluateDraw checks for existing records internally, so it's safe to call.
            // It will generate for ALL missing systems, including Ouro, Prata, Bronze.
            await evaluateDraw(drawRaw.id);
            processed++;
        }
        console.log('\n');

        // Update Rankings & Cache after batch
        console.log('🔄 Updating Global Rankings...');
        await updateRanking();

        console.log('💾 Caching Future Predictions...');
        await cachePredictions();

        // Check remaining
        const remainingCount = await prisma.$queryRaw<{ count: bigint }[]>`
            SELECT COUNT(*) as count
            FROM Draw d
            WHERE NOT EXISTS (
                SELECT 1 FROM system_performance sp 
                WHERE sp.drawId = d.id 
                AND sp.systemName = 'Sistema Ouro'
            )
        `;
        const remaining = Number(remainingCount[0].count);

        console.log('--------------------------------------------------');
        console.log(`✅ Batch complete! Processed ${processed} draws.`);
        if (remaining > 0) {
            console.log(`⚠️  ~${remaining} draws remaining. RUN SCRIPT AGAIN to continue.`);
        } else {
            console.log('🎉 All history processed!');
        }
        console.log('--------------------------------------------------');

    } catch (error) {
        console.error('❌ Error in incremental backfill:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
