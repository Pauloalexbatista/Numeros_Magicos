
import { prisma } from '@/lib/prisma';
import { rankedSystems } from '@/services/ranked-systems';

const BATCH_SIZE = 50; // History to seed per system

async function seedSystemByName(targetSystemName: string) {
    // Find the system
    const system = rankedSystems.find(s => s.name === targetSystemName);

    if (!system) {
        console.error(`❌ System "${targetSystemName}" not found!`);
        return;
    }

    console.log(`🤖 SEEDING SINGLE SYSTEM: ${system.name}`);
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

    let processed = 0;
    let saved = 0;

    for (const draw of sortedDraws) {
        // Context: Draws OLDER than current
        const drawIndex = draws.findIndex(d => d.id === draw.id);
        const history = draws.slice(drawIndex + 1);

        if (history.length < 50) continue;

        const actualNumbers = typeof draw.numbers === 'string'
            ? JSON.parse(draw.numbers)
            : draw.numbers;

        const allNumbers = Array.from({ length: 50 }, (_, i) => i + 1);

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

            const prediction = await system.generateTop10(history as any[]);

            // Anti-Prediction: The numbers NOT in the prediction (up to 25)
            const antiPrediction = allNumbers
                .filter(n => !prediction.includes(n))
                .slice(0, 25);

            const hits = prediction.filter(n => actualNumbers.includes(n)).length;
            const antiHits = antiPrediction.filter(n => actualNumbers.includes(n)).length;

            await prisma.systemPrediction.create({
                data: {
                    drawId: draw.id,
                    systemName: system.name,
                    prediction: JSON.stringify(prediction),
                    antiPrediction: JSON.stringify(antiPrediction),
                    hits,
                    antiHits,
                    jackpot: hits === 5,
                    antiJackpot: antiHits === 5
                }
            });
            saved++;

        } catch (err) { }

        processed++;
        // Optional: progress bar for this specific system
        // process.stdout.write('.');
    }

    console.log(`\n✅ ${system.name}: Processed ${processed} draws, Saved ${saved} new records.`);
}

// Allow running directly via CLI if called directly
if (require.main === module) {
    const args = process.argv.slice(2);
    const sysName = args.join(' ');
    if (sysName) {
        seedSystemByName(sysName)
            .catch(console.error)
            .finally(() => prisma.$disconnect());
    } else {
        console.log('Please provide a system name.');
    }
}

export { seedSystemByName };
