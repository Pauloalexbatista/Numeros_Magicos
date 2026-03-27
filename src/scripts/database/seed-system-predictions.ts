
import { prisma } from '@/lib/prisma';
import { rankedSystems } from '@/services/ranked-systems';

const BATCH_SIZE = 50; // History to seed

async function seedSystemPredictions() {
    console.log('🔄 SEEDING SYSTEM PREDICTIONS (Line-by-Line)');
    console.log('═'.repeat(60));

    // Get last N draws
    const draws = await prisma.draw.findMany({
        orderBy: { date: 'desc' },
        take: BATCH_SIZE + 200 // Context for logic
    });

    if (draws.length < 200) {
        console.log('⚠️ Not enough draws for analysis.');
        return;
    }

    // Process the newest BATCH_SIZE draws
    const targetDraws = draws.slice(0, BATCH_SIZE);

    // Sort oldest to newest for processing
    const sortedDraws = targetDraws.reverse();

    console.log(`🎯 Backfilling ${sortedDraws.length} draws for ${rankedSystems.length} systems...`);

    let processed = 0;

    for (const draw of sortedDraws) {
        process.stdout.write(`Evaluating Draw ${draw.id} (${draw.date.toISOString().split('T')[0]})... `);

        // Context: Draws OLDER than current
        const drawIndex = draws.findIndex(d => d.id === draw.id);
        const history = draws.slice(drawIndex + 1);

        if (history.length < 50) {
            console.log('Skipping (low context)');
            continue;
        }

        const actualNumbers = typeof draw.numbers === 'string'
            ? (typeof draw.numbers === "string" ? JSON.parse(draw.numbers) : draw.numbers)
            : draw.numbers;

        const allNumbers = Array.from({ length: 50 }, (_, i) => i + 1);
        const records: any[] = [];

        for (const system of rankedSystems) {
            try {
                // Check if exists
                const existing = await prisma.systemPrediction.findUnique({
                    where: {
                        drawId_systemName: {
                            drawId: draw.id,
                            systemName: system.name
                        }
                    }
                });

                if (existing) continue;

                // Predict Top 25 (Standard) based on logic
                // Note: systems usually return Top 10 or 25. 
                // We'll ask for a large set if possible or map the Top 10.
                // Assuming generateTop10 actually returns more logic or we can request more.
                // Looking at standard implementations, they usually allow getting sorted candidates.
                // For now, we use generateTop10 and assume we might need to extend it later 
                // OR we accept that "Prediction" is the system's output.

                // WAIT. The system usually returns just numbers. 
                // We want 25 numbers. 
                // Most `generateTop10` return 10. 
                // We might need to ask for 25 if the method supports it. 
                // For now, let's use what `generateTop10` returns (usually 10-12) 
                // and fill with others or just use it.
                // Actually, let's just stick to the system's output.

                const prediction = await system.generateTop10(history as any[]);

                // Anti-Prediction: The numbers NOT in the prediction (up to 25)
                const antiPrediction = allNumbers
                    .filter(n => !prediction.includes(n))
                    .slice(0, 25);

                const hits = prediction.filter(n => actualNumbers.includes(n)).length;
                const antiHits = antiPrediction.filter(n => actualNumbers.includes(n)).length;

                records.push({
                    drawId: draw.id,
                    systemName: system.name,
                    prediction: JSON.stringify(prediction),
                    antiPrediction: JSON.stringify(antiPrediction),
                    hits,
                    antiHits,
                    jackpot: hits === 5,
                    antiJackpot: antiHits === 5
                });

            } catch (err) { }
        }

        if (records.length > 0) {
            await prisma.systemPrediction.createMany({ data: records });
            console.log(`✅ Saved ${records.length} systems`);
        } else {
            console.log('⏭️ Skipped (Existing)');
        }

        processed++;
    }

    console.log('\n✅ Seeding Complete!');
}

seedSystemPredictions()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
