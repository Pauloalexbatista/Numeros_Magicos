import { prisma } from '../lib/prisma';
import { aiExclusionService } from '../services/ai-exclusion';

const SYSTEM_NAME = "AI_Exclusion_5";

async function main() {
    console.log(`🤖 Updating AI Exclusion Cache (${SYSTEM_NAME})...`);

    try {
        // 1. Ensure System Exists
        await prisma.rankedSystem.upsert({
            where: { name: SYSTEM_NAME },
            update: {},
            create: {
                name: SYSTEM_NAME,
                description: "AI Neural Network (LSTM) trained to identify missing numbers.",
                isActive: true
            }
        });

        // 2. Get History
        const history = await prisma.draw.findMany({
            orderBy: { date: 'desc' },
            take: 20 // We only need the last one really, but fetching a few is fine
        });

        if (history.length === 0) {
            console.log("No history found.");
            return;
        }

        // 3. Predict
        const exclusions = aiExclusionService.predictExclusions(history, 5);
        console.log(`🚫 AI suggests excluding: ${exclusions.join(', ')}`);

        // 4. Update Cache
        // Note: CachedPrediction usually stores "numbers" (Top 25) and "worstNumbers" (Bottom 25).
        // Here, our "prediction" IS the exclusion list.
        // To fit the schema, we can store the exclusions in `worstNumbers` (logic: these are the worst).
        // And maybe in `numbers` we store the REST? Or just empty?
        // Let's store the REST (Safe numbers) in `numbers` and Exclusions in `worstNumbers`.

        const allNumbers = Array.from({ length: 50 }, (_, i) => i + 1);
        const safeNumbers = allNumbers.filter(n => !exclusions.includes(n));

        await prisma.cachedPrediction.upsert({
            where: { systemName: SYSTEM_NAME },
            update: {
                numbers: JSON.stringify(safeNumbers), // The "Good" numbers (45 of them)
                worstNumbers: JSON.stringify(exclusions), // The "Bad" numbers (5 of them)
                updatedAt: new Date()
            },
            create: {
                systemName: SYSTEM_NAME,
                numbers: JSON.stringify(safeNumbers),
                worstNumbers: JSON.stringify(exclusions)
            }
        });

        console.log("✅ Cache updated successfully.");

    } catch (error) {
        console.error("❌ Error updating AI cache:", error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
