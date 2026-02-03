
import { prisma } from '@/lib/prisma';
import { evaluateDraw, updateRanking, cachePredictions, evaluateDrawStars } from '@/services/ranking';
import { updateAllStatisticsCache } from '@/services/cache/statisticsCache';

async function main() {
    console.log("Seeding Jan 30, 2026...");

    const drawDate = new Date('2026-01-30');
    const numbers = [14, 18, 31, 35, 46];
    const stars = [7, 11];

    // Check existing
    const existing = await prisma.draw.findFirst({
        where: {
            game: 'EUROMILLIONS',
            date: drawDate
        }
    });

    if (existing) {
        console.log("Draw already exists!");
        return;
    }

    const newDraw = await prisma.draw.create({
        data: {
            game: 'EUROMILLIONS',
            date: drawDate,
            numbers: JSON.stringify(numbers),
            stars: JSON.stringify(stars),
            numbersDrawOrder: JSON.stringify(numbers), // We don't have order, assume sorted
            starsDrawOrder: JSON.stringify(stars),
            jackpot: 123000000,
            hasWinner: true,
        },
    });

    console.log(`✅ Created draw ${newDraw.id}. Running calculations...`);

    try {
        await evaluateDraw(newDraw.id);
        await evaluateDrawStars(newDraw.id);
        console.log("✅ Draw evaluated.");

        console.log("Updating Rankings...");
        await updateRanking();

        console.log("Caching Predictions...");
        await cachePredictions();

        console.log("Updating Statistics...");
        await updateAllStatisticsCache();

        console.log("🎉 SUCCESS! Manual seed complete.");
    } catch (e) {
        console.error("❌ Calculation error:", e);
    }
}

main().catch(console.error);
