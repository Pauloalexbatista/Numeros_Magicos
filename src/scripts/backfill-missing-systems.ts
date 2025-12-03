import { prisma } from '../lib/prisma';
import { rankedSystems } from '../services/ranked-systems';
import { evaluateDraw, updateRanking, cachePredictions } from '../services/ranking';

async function main() {
    console.log('🔧 Backfilling Missing Systems...');

    // 1. Get all draws
    const draws = await prisma.draw.findMany({
        orderBy: { date: 'asc' },
        include: { systemPerformances: true }
    });

    console.log(`Found ${draws.length} draws in history.`);

    let totalAdded = 0;

    // 2. Iterate through draws
    for (const draw of draws) {
        const actualNumbers = JSON.parse(draw.numbers) as number[];

        // Get history up to this draw (exclusive) for prediction
        // Optimization: We can't easily fetch history inside the loop for every draw without being slow.
        // But evaluateDraw does exactly that.
        // To speed this up, we should only call evaluateDraw if we KNOW something is missing.

        const existingSystemNames = draw.systemPerformances.map(p => p.systemName);
        const missingSystems = rankedSystems.filter(s => !existingSystemNames.includes(s.name));

        if (missingSystems.length === 0) continue;

        // process.stdout.write(`\rRepairing draw ${draw.id} (${draw.date.toISOString().split('T')[0]}): Missing ${missingSystems.length} systems...`);

        // We can't use evaluateDraw directly because it fetches history internally and might be slow if called 1500 times.
        // However, for correctness, we should use it.
        // Let's try to use it but only for the missing ones.
        // Actually, evaluateDraw iterates ALL systems. We should modify it or create a helper?
        // No, evaluateDraw checks `existingPerf` and skips if found. So it is safe to call.
        // The performance bottleneck is `prisma.draw.findMany` inside `evaluateDraw`.

        // For now, let's just call evaluateDraw. If it's too slow, we'll optimize.
        // Since we are running this as a one-off repair script, correctness > speed.

        await evaluateDraw(draw.id);
        totalAdded += missingSystems.length;

        if (totalAdded % 50 === 0) {
            process.stdout.write(`\r✅ Backfilled ${totalAdded} performances... (Current: ${draw.date.toISOString().split('T')[0]})`);
        }
    }

    console.log('\n\n🔄 Updating Global Rankings...');
    await updateRanking();

    console.log('💾 Caching Future Predictions...');
    await cachePredictions();

    console.log(`\n✅ Repair complete! Added ${totalAdded} missing performance records.`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
