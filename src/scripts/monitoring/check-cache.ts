
import { prisma } from '@/lib/prisma';

async function main() {
    console.log("🔍 Checking Cached Predictions...");
    const cached = await prisma.cachedPrediction.findMany({
        select: { systemName: true, updatedAt: true }
    });

    if (cached.length === 0) {
        console.log("❌ No cached predictions found.");
    } else {
        console.log("✅ Found cached predictions:");
        cached.forEach(c => console.log(`   - ${c.systemName} (Updated: ${c.updatedAt.toISOString()})`));
    }
}

main();
