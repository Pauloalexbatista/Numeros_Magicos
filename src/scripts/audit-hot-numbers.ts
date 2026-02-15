

import { prisma } from '../lib/prisma';
import { rankedSystems } from '../services/ranked-systems';

console.log('Script started...');

async function auditSuspiciousPrediction() {

    console.log('🕵️ AUDIT: Investigating EuroDreams Hot Numbers Anomaly');

    // 1. Identify the Target Draw (Feb 2nd 2026)
    // Adjust logic to find exactly the draw the user complained about
    const targetDate = new Date('2026-02-02');
    const draw = await prisma.draw.findFirst({
        where: {
            game: 'EURODREAMS',
            date: {
                gte: new Date('2026-02-02T00:00:00.000Z'),
                lt: new Date('2026-02-02T23:59:59.999Z')
            }
        }
    });

    if (!draw) {
        console.error('❌ Could not find Draw for 2026-02-02!');
        return;
    }

    console.log(`\n📅 Target Draw: ${draw.date.toISOString()} (ID: ${draw.id})`);
    console.log(`🔢 Actual Numbers: ${draw.numbers}`);

    // 2. Fetch History (SIMULATING EXACTLY WHAT THE SYSTEM SEES)
    // The query MUST be strictly LESS THAN the target date
    const history = await prisma.draw.findMany({
        where: {
            game: 'EURODREAMS',
            date: { lt: draw.date } // STRICTLY LESS THAN
        },
        orderBy: { date: 'desc' },
        take: 200 // Assuming default history length
    });

    console.log(`📚 History Size: ${history.length} draws`);
    console.log(`   Most Recent History Draw: ${history[0]?.date.toISOString()} (ID: ${history[0]?.id})`);

    // Verify Leakage: Is target ID in history?
    const leaked = history.find(h => h.id === draw.id);
    if (leaked) {
        console.error('🚨 LEAK DETECTED! The target draw IS inside the history passed to the system!');
    } else {
        console.log('✅ No obvious ID leakage in history array.');
    }

    // 3. Find "Hot Numbers" System
    const hotSystem = rankedSystems.find(s => s.name === 'Hot Numbers'); // Or exact name
    if (!hotSystem) {
        console.error('❌ System "Hot Numbers" not found in registry.');
        return;
    }

    console.log(`\n🤖 Running System: ${hotSystem.name}...`);
    const prediction = await hotSystem.generateTop10(history); // It usually returns 25 numbers

    console.log(`🔮 Prediction: ${JSON.stringify(prediction)}`);

    // 4. Calculate Hits
    const actual = JSON.parse(draw.numbers);
    const hits = actual.filter(n => prediction.includes(n));
    console.log(`💥 Hits Found: ${hits.length} (${hits.join(', ')})`);

    if (hits.length === 6) {
        console.log('😱 REPRODUCED! The system predicts 6 numbers correctly.');
        console.log('   Analyze the prediction array. If it starts with the winning numbers exactly, it suggests sorting by recent/frequency might be degenerate.');
    } else {
        console.log(`📉 Logic Check Result: ${hits.length}/6. If database says 6, then database record is stale or calculated differently.`);
    }

    // 5. Check Database Record (Look for Canonical Name)
    const systemName = 'Hot Numbers (EuroDreams)';
    const dbRecord = await prisma.systemPerformance.findFirst({
        where: {
            drawId: draw.id,
            systemName: systemName
        }
    });

    console.log(`\n🗄️  Database Record Analysis (${systemName}):`);
    if (dbRecord) {
        console.log(`   Predicted Stored: ${dbRecord.predictedNumbers}`);
        console.log(`   Acc: ${dbRecord.accuracy}% | Hits: ${dbRecord.hits}`);

        const storedPred = JSON.parse(dbRecord.predictedNumbers);
        const dbHits = actual.filter((n: any) => storedPred.includes(n));
        console.log(`   Re-verified DB Hits: ${dbHits.length}`);
    } else {
        console.log('   ❌ No record found in DB for this system/draw.');
    }

    // 6. Simulate Turbo Backfill Logic (Stateful)
    console.log('\n🏎️  Running Turbo Backfill Logic (StatefulHotNumbers)...');

    // Mini implementation of StatefulHotNumbers
    class StatefulHotNumbers {
        frequency: Record<number, number> = {};

        update(draw: any) {
            const nums = typeof draw.numbers === 'string' ? JSON.parse(draw.numbers) : draw.numbers;
            nums.forEach((n: number) => {
                this.frequency[n] = (this.frequency[n] || 0) + 1;
            });
        }

        predict(): number[] {
            const candidates = Object.entries(this.frequency)
                .sort(([, a], [, b]) => b - a)
                .map(([num]) => parseInt(num));

            // ensure 25-ish (simplified)
            return candidates.slice(0, 25);
        }
    }

    const turboSys = new StatefulHotNumbers();
    // Feed ALL history
    history.sort((a, b) => a.date.getTime() - b.date.getTime()).forEach(d => turboSys.update(d));

    // Predict
    const turboPred = turboSys.predict();
    const turboHits = actual.filter((n: any) => turboPred.includes(n));
    console.log(`   Turbo Prediction: ${JSON.stringify(turboPred)}`);
    console.log(`   Turbo Hits: ${turboHits.length}`);
}

auditSuspiciousPrediction()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
