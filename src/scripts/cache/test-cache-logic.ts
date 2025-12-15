
import { updateAllStatisticsCache, getCachedStatistics } from '../../services/cache/statisticsCache';
import { prisma } from '@/lib/prisma';

async function testCache() {
    console.log("🧪 Testing Statistics Cache Logic...");

    console.log("1. Triggering Update...");
    const success = await updateAllStatisticsCache();
    if (!success) {
        console.error("❌ Update failed.");
        return;
    }

    console.log("2. Verifying Pyramid Stats...");
    const pyramidStats = await getCachedStatistics('PYRAMID_STATS_10');
    if (pyramidStats) {
        console.log("✅ Pyramid Stats found in cache!");
        // console.log(JSON.stringify(pyramidStats).slice(0, 100) + "...");
    } else {
        console.error("❌ Pyramid Stats NOT found.");
    }

    console.log("3. Verifying Number Stats...");
    const numberStats = await getCachedStatistics('GLOBAL_NUMBER_STATS');
    if (numberStats) {
        console.log("✅ Number Stats found in cache!");
    } else {
        console.error("❌ Number Stats NOT found.");
    }

    console.log("4. Verifying Vortex Stats...");
    const vortexStats = await getCachedStatistics('VORTEX_RESONANCE_STATS');
    if (vortexStats) {
        console.log("✅ Vortex Stats found in cache!");
    } else {
        console.error("❌ Vortex Stats NOT found.");
    }
}

testCache()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
