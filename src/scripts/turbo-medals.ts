
import { prisma } from '../lib/prisma';
import { Draw } from '@prisma/client';

import { initializeSystems } from '../services/ranking';

// --- Configuration ---
const WINDOW_SIZE = 100; // Lookback for ranking calculation

// --- Helper Functions ---
function parseNumbers(json: string | number[]): number[] {
    if (typeof json === 'string') return JSON.parse(json);
    return json as number[];
}

function calculateAccuracy(hits: number): number {
    return (hits / 5) * 100;
}

// --- Main ---
async function main() {
    console.log('🏅 Starting TURBO Medal Backfill...');
    const startTime = performance.now();

    // 0. Ensure Systems Exist
    console.log('🛠️  Initializing Systems in DB...');
    await initializeSystems();

    // 1. Load All Draws (Oldest First)
    console.log('📦 Loading history...');
    const draws = await prisma.draw.findMany({
        orderBy: { date: 'asc' },
        select: { id: true, date: true, numbers: true }
    });
    console.log(`Loaded ${draws.length} draws.`);

    // 2. Load All Base System Performances
    // We need this to know what each system predicted at each draw
    console.log('📦 Loading system performances (this might take a moment)...');
    const allPerformances = await prisma.systemPerformance.findMany({
        where: {
            systemName: { notIn: ['Sistema Ouro', 'Sistema Prata', 'Sistema Bronze', 'Sistema Platina'] }
        },
        select: {
            drawId: true,
            systemName: true,
            predictedNumbers: true,
            accuracy: true
        }
    });
    console.log(`Loaded ${allPerformances.length} performance records.`);

    // Organize performances by DrawID for fast lookup
    // Map<DrawId, Map<SystemName, Performance>>
    const perfByDraw = new Map<number, Map<string, any>>();

    for (const p of allPerformances) {
        if (!perfByDraw.has(p.drawId)) {
            perfByDraw.set(p.drawId, new Map());
        }
        perfByDraw.get(p.drawId)!.set(p.systemName, p);
    }

    // 3. Simulate History
    console.log('🔄 Simulating history...');

    // Track system accuracy history for ranking: Map<SystemName, CircularBuffer<Accuracy>>
    const systemHistory = new Map<string, number[]>();

    const medalBuffer: any[] = [];
    let processed = 0;
    const totalDraws = draws.length;
    const simStartTime = performance.now();

    // We need to cleanup existing Medal records first
    await prisma.systemPerformance.deleteMany({
        where: { systemName: { in: ['Sistema Ouro', 'Sistema Prata', 'Sistema Bronze', 'Sistema Platina'] } }
    });

    for (const draw of draws) {
        // A. Calculate Current Rankings
        const currentRankings = Array.from(systemHistory.entries()).map(([name, accuracies]) => {
            const total = accuracies.reduce((a, b) => a + b, 0);
            const avg = accuracies.length > 0 ? total / accuracies.length : 0;
            return { name, avg };
        }).sort((a, b) => b.avg - a.avg);

        // B. Generate Medal Predictions (Incremental Optimization)
        if (currentRankings.length >= 3) {
            const actualNumbers = parseNumbers(draw.numbers);
            const drawPerfs = perfByDraw.get(draw.id);

            if (drawPerfs) {
                const votes: Record<number, number> = {};

                // Helper to finalize prediction from current votes
                const finalizePrediction = (systemName: string) => {
                    const ensemblePrediction = Object.entries(votes)
                        .sort(([, a], [, b]) => b - a)
                        .slice(0, 25)
                        .map(([num]) => parseInt(num));

                    const hits = actualNumbers.filter(n => ensemblePrediction.includes(n)).length;

                    medalBuffer.push({
                        drawId: draw.id,
                        systemName: systemName,
                        predictedNumbers: JSON.stringify(ensemblePrediction),
                        actualNumbers: JSON.stringify(actualNumbers),
                        hits,
                        accuracy: calculateAccuracy(hits)
                    });
                };

                // 1. Gold (Top 3)
                for (let i = 0; i < 3; i++) {
                    const sys = currentRankings[i];
                    const perf = drawPerfs.get(sys.name);
                    if (perf) {
                        const preds = parseNumbers(perf.predictedNumbers);
                        preds.forEach(num => votes[num] = (votes[num] || 0) + sys.avg);
                    }
                }
                finalizePrediction('Sistema Ouro');

                // 2. Silver (Top 6) - Add next 3
                for (let i = 3; i < 6; i++) {
                    if (i >= currentRankings.length) break;
                    const sys = currentRankings[i];
                    const perf = drawPerfs.get(sys.name);
                    if (perf) {
                        const preds = parseNumbers(perf.predictedNumbers);
                        preds.forEach(num => votes[num] = (votes[num] || 0) + sys.avg);
                    }
                }
                finalizePrediction('Sistema Prata');

                // 3. Bronze (Top 9) - Add next 3
                for (let i = 6; i < 9; i++) {
                    if (i >= currentRankings.length) break;
                    const sys = currentRankings[i];
                    const perf = drawPerfs.get(sys.name);
                    if (perf) {
                        const preds = parseNumbers(perf.predictedNumbers);
                        preds.forEach(num => votes[num] = (votes[num] || 0) + sys.avg);
                    }
                }
                finalizePrediction('Sistema Bronze');

                // 4. Platinum (Top 12) - Add next 3
                for (let i = 9; i < 12; i++) {
                    if (i >= currentRankings.length) break;
                    const sys = currentRankings[i];
                    const perf = drawPerfs.get(sys.name);
                    if (perf) {
                        const preds = parseNumbers(perf.predictedNumbers);
                        preds.forEach(num => votes[num] = (votes[num] || 0) + sys.avg);
                    }
                }
                finalizePrediction('Sistema Platina');
            }
        }

        // C. Update History for NEXT draw
        const drawPerfs = perfByDraw.get(draw.id);
        if (drawPerfs) {
            for (const [name, perf] of drawPerfs.entries()) {
                if (!systemHistory.has(name)) systemHistory.set(name, []);
                const history = systemHistory.get(name)!;
                history.push(perf.accuracy);
                if (history.length > WINDOW_SIZE) history.shift();
            }
        }

        // Flush buffer
        if (medalBuffer.length >= 1000) {
            await prisma.systemPerformance.createMany({ data: medalBuffer });
            medalBuffer.length = 0;
        }

        processed++;

        // Progress UI
        if (processed % 50 === 0) {
            const elapsed = (performance.now() - simStartTime) / 1000;
            const pct = ((processed / totalDraws) * 100).toFixed(1);
            const rate = (processed / elapsed).toFixed(0);
            process.stdout.write(`\r⏳ Progress: ${pct}% | ${processed}/${totalDraws} | ${elapsed.toFixed(1)}s | ${rate} draws/s`);
        }
    }

    // Final Flush
    if (medalBuffer.length > 0) {
        await prisma.systemPerformance.createMany({ data: medalBuffer });
    }

    const endTime = performance.now();
    console.log(`\n✅ Medal Backfill Complete!`);
    console.log(`⏱️  Total Time: ${((endTime - startTime) / 1000).toFixed(2)}s`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
