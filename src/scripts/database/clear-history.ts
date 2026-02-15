
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log("🧹 CLEARING ALL PREDICTION HISTORY AND RANKINGS...");
    console.log("⚠️  Keep Draws and Users. Deleting everything else related to calculations.");

    try {
        // Predictions & Cache
        await prisma.cachedPrediction.deleteMany({});
        console.log("✅ Deleted CachedPrediction");

        await prisma.systemPrediction.deleteMany({});
        console.log("✅ Deleted SystemPrediction");

        // Performance & Rankings (Numbers)
        await prisma.systemPerformance.deleteMany({});
        console.log("✅ Deleted SystemPerformance");

        await prisma.systemPerformanceStaging.deleteMany({});
        console.log("✅ Deleted SystemPerformanceStaging");

        await prisma.systemRanking.deleteMany({});
        console.log("✅ Deleted SystemRanking");

        // Performance & Rankings (Stars)
        await prisma.starSystemPerformance.deleteMany({});
        console.log("✅ Deleted StarSystemPerformance");

        await prisma.starSystemRanking.deleteMany({});
        console.log("✅ Deleted StarSystemRanking");

        // Exclusion / ML (Optional but good to clean if full reset)
        await prisma.exclusionPerformance.deleteMany({});
        console.log("✅ Deleted ExclusionPerformance");

        await prisma.exclusionCache.deleteMany({});
        console.log("✅ Deleted ExclusionCache");

        await prisma.statisticsCache.deleteMany({});
        console.log("✅ Deleted StatisticsCache");

        console.log("\n✨ DATABASE CLEANED. Only Draws, Users, and System Definitions remain.");

    } catch (error) {
        console.error("❌ Error clearing database:", error);
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
