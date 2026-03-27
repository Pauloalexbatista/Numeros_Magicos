
import { prisma } from '@/lib/prisma';
import { getSystemByName, SystemRegistry } from '../../systems';
import { Draw } from '@prisma/client';

// Simple Arg Parser
const args = process.argv.slice(2);
const nameArg = args.find(a => a.startsWith('--name='))?.split('=')[1] || args[args.indexOf('--name') + 1];
const runBackfill = args.includes('--history');

async function main() {
    console.log('🔧 SYSTEM RECALCULATOR TOOL');
    console.log('============================');

    if (!nameArg) {
        console.error('❌ Error: Missing --name argument.');
        console.log('Usage: npm run recalc:system -- --name="Vortex" [--history]');
        console.log('\nAvailable Systems:');
        SystemRegistry.forEach(s => console.log(` - ${s.metadata.name}`));
        process.exit(1);
    }

    const system = getSystemByName(nameArg);

    if (!system) {
        console.error(`❌ Error: System "${nameArg}" not found.`);
        const similar = SystemRegistry.find(s => s.metadata.name.toLowerCase().includes(nameArg.toLowerCase()));
        if (similar) {
            console.log(`💡 Did you mean "${similar.metadata.name}"?`);
        }
        process.exit(1);
    }

    console.log(`✅ Selected System: ${system.metadata.name}`);
    console.log(`📝 Description: ${system.metadata.description}`);

    // 1. Load History
    const history = await prisma.draw.findMany({
        orderBy: { date: 'desc' }
    });
    console.log(`📚 Loaded ${history.length} draws from history.`);

    // 2. Generate Next Prediction (Default)
    console.log('\n🔮 Generating Next Prediction...');
    try {
        const start = performance.now();
        const result = await system.predict(history);
        const end = performance.now();

        console.log(`⚡ Calculation took ${(end - start).toFixed(0)}ms`);
        console.log(`🎲 Prediction: [${result.numbers.join(', ')}]`);

        // Save to DB
        const allNumbers = Array.from({ length: 50 }, (_, i) => i + 1);
        const worstNumbers = allNumbers.filter(n => !result.numbers.includes(n)); // Simplified logic

        await prisma.cachedPrediction.upsert({
            where: { systemName: system.metadata.name },
            update: {
                numbers: JSON.stringify(result.numbers),
                worstNumbers: JSON.stringify(worstNumbers),
                updatedAt: new Date()
            },
            create: {
                systemName: system.metadata.name,
                numbers: JSON.stringify(result.numbers),
                worstNumbers: JSON.stringify(worstNumbers)
            }
        });
        console.log('💾 Saved to CachedPrediction table.');

    } catch (error) {
        console.error('❌ Prediction Failed:', error);
        process.exit(1);
    }

    // 3. Run History Backfill (Optional)
    if (runBackfill) {
        console.log('\n📜 Running Historical Backfill (Last 50 draws)...');

        // Take last 50 draws (excluding latest if it's the one we just predicted, but actually history includes it)
        // We want to predict Draw N using Draw N-1...0

        const drawsToTest = history.slice(0, 50).reverse(); // Oldest to Newest

        let hitsSum = 0;
        let processed = 0;

        for (const draw of drawsToTest) {
            // Filter history to ONLY draws before this one
            const specificHistory = history.filter(h => h.date < draw.date);

            // Calc
            const pred = await system.predict(specificHistory);

            // Check Hit
            const actual = (typeof draw.numbers === "string" ? JSON.parse(draw.numbers) : draw.numbers);
            const hits = actual.filter((n: number) => pred.numbers.includes(n)).length;
            const accuracy = (hits / 5) * 100;

            hitsSum += hits;
            processed++;

            process.stdout.write(`\rDraw ${draw.date.toISOString().split('T')[0]}: ${hits} Hits [${pred.numbers.slice(0, 5).join(',')}]`);

            // Save Performance
            await prisma.systemPerformance.upsert({
                where: {
                    drawId_systemName: {
                        drawId: draw.id,
                        systemName: system.metadata.name
                    }
                },
                update: {
                    predictedNumbers: JSON.stringify(pred.numbers),
                    actualNumbers: draw.numbers,
                    hits,
                    accuracy
                },
                create: {
                    drawId: draw.id,
                    systemName: system.metadata.name,
                    predictedNumbers: JSON.stringify(pred.numbers),
                    actualNumbers: draw.numbers,
                    hits,
                    accuracy
                }
            });
        }
        console.log(`\n\n✅ Backfill Complete. Average Hits: ${(hitsSum / processed).toFixed(2)}`);
    } else {
        console.log('\n(Skipping historical backfill. Use --history to run it)');
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
