import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getUnifiedSystemPerformance(systemName: string) {
    try {
        // Step 1: Get ALL performances for this system
        const allPerformances = await prisma.systemPerformance.findMany({
            where: { systemName },
            include: { draw: true },
            orderBy: { draw: { date: 'desc' } }
        });

        if (allPerformances.length === 0) return null;

        // Step 2: DEDUPLICATE - Keep only the most recent record per draw
        const seenDrawIds = new Set<number>();
        const uniquePerformances = allPerformances.filter(p => {
            if (seenDrawIds.has(p.drawId)) {
                return false; // Skip duplicate
            }
            seenDrawIds.add(p.drawId);
            return true;
        });

        // Step 3: Calculate statistics from UNIQUE records
        const distribution = [0, 0, 0, 0, 0, 0];
        let totalHits = 0;

        uniquePerformances.forEach(p => {
            const hits = Math.min(5, Math.max(0, p.hits));
            distribution[hits]++;
            totalHits += hits;
        });

        const accuracy = uniquePerformances.length > 0
            ? ((totalHits / uniquePerformances.length) / 5) * 100
            : 0;

        const jackpots = distribution[5];

        return {
            systemName,
            totalDraws: uniquePerformances.length,
            accuracy,
            distribution,
            jackpots,
            totalRecordsBeforeDedup: allPerformances.length,
            duplicatesRemoved: allPerformances.length - uniquePerformances.length
        };

    } catch (error) {
        console.error(`Error:`, error);
        return null;
    }
}

async function test() {
    console.log('🧪 TESTING UNIFIED SERVICE\n');
    console.log('='.repeat(60));

    const data = await getUnifiedSystemPerformance('LSTM Neural Net');

    if (!data) {
        console.log('❌ No data found!');
        return;
    }

    console.log('\n📊 UNIFIED RESULTS FOR: LSTM Neural Net');
    console.log(`   Total Records (Before Dedup): ${data.totalRecordsBeforeDedup}`);
    console.log(`   Duplicates Removed: ${data.duplicatesRemoved}`);
    console.log(`   Total Draws (Unique): ${data.totalDraws}`);
    console.log(`   Jackpots (5 hits): ${data.jackpots}`);
    console.log(`   Accuracy: ${data.accuracy.toFixed(2)}%`);

    console.log('\n📈 Distribution:');
    data.distribution.forEach((count, hits) => {
        const pct = data.totalDraws > 0 ? ((count / data.totalDraws) * 100).toFixed(2) : '0.00';
        console.log(`   ${hits} hits: ${count} (${pct}%)`);
    });

    console.log('\n' + '='.repeat(60));
    console.log('✅ THIS IS THE CORRECT NUMBER TO SHOW EVERYWHERE!\n');

    await prisma.$disconnect();
}

test().catch(console.error);
