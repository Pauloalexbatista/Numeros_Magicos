
import { prisma } from '@/lib/prisma';
import { getSystemByName } from '@/services/ranked-systems';

async function verifyLeakage() {
    console.log("🕵️ Starting Leakage Verification...");

    // 1. Fetch the LATEST draw (The "Target")
    const latestDraw = await prisma.draw.findFirst({
        orderBy: { date: 'desc' }
    });

    if (!latestDraw) {
        console.error("❌ No draws found in database.");
        return;
    }

    console.log(`\n🎯 TARGET DRAW:`);
    console.log(`ID: ${latestDraw.id}`);
    console.log(`Date: ${latestDraw.date.toISOString()}`);
    console.log(`Numbers: ${latestDraw.numbers}`);

    // 2. Simulate the HISTORY query from evaluateDraw
    console.log(`\n🔍 Executing History Query (date < target.date)...`);
    const history = await prisma.draw.findMany({
        where: {
            date: {
                lt: latestDraw.date
            }
        },
        orderBy: {
            date: 'desc'
        },
        take: 5 // Just inspect top 5 closest
    });

    console.log(`\n📂 HISTORY SENT TO SYSTEMS (Top 5 Closest):`);
    history.forEach((d, i) => {
        const isTarget = d.id === latestDraw.id;
        const icon = isTarget ? "❌ LEAK DETECTED" : "✅ OK";
        console.log(`[${i}] ID: ${d.id} | Date: ${d.date.toISOString()} | ${icon}`);
    });

    // 3. Check for Leakage
    const leakFound = history.some(d => d.id === latestDraw.id);
    if (leakFound) {
        console.error("\n🚨 CRITICAL: The target draw IS present in the history!");
        console.error("The system IS seeing the answer before predicting.");
    } else {
        console.log("\n✅ PASSED: The target draw is NOT in the history.");
        console.log("The system relies only on past data.");
    }

    // 4. Test "Hot Numbers" simple generation
    console.log("\n🧠 Testing 'Hot Numbers' Generation...");
    const hotNumbersSystem = getSystemByName('Hot Numbers');
    if (hotNumbersSystem) {
        const prediction = await hotNumbersSystem.generateTop10(history); // It expects Draw[], checking types
        console.log(`Prediction generated: ${prediction.join(', ')}`);

        // Simple check: Is it just the numbers from the latest history draw?
        const lastHistoryNumbers = JSON.parse(history[0].numbers);
        const intersection = prediction.filter(n => lastHistoryNumbers.includes(n));
        console.log(`Intersection with immediate previous draw: ${intersection.length} numbers`);
    }

}

verifyLeakage()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
