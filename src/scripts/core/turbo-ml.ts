
import { trainAllModels } from '../../services/ml/turboTraining';
import { prisma } from '@/lib/prisma';
import { Draw } from '@prisma/client';

// Import ML Systems
import { LSTMModel } from '../../services/ml/lstm';
import { MLClassifierModel } from '../../models/implementations/MLClassifierModel';
import { PredictionModelAdapter } from '../../services/ranked-systems';

// --- Reusing Adapter Logic (Simplified for this Script) ---
class WindowedAdapter {
    name: string;
    private originalSystem: any;
    private historyBuffer: Draw[] = [];
    private windowSize = 3000; // Updated to full history (was 100)

    constructor(system: any) {
        this.name = system.name;
        this.originalSystem = system;
    }

    reset() {
        this.historyBuffer = [];
    }

    update(draw: Draw) {
        this.historyBuffer.unshift(draw);
        if (this.historyBuffer.length > this.windowSize) {
            this.historyBuffer.pop();
        }
    }

    async predictNext(): Promise<number[]> {
        if (this.historyBuffer.length < 5) return []; // Need minimum history
        try {
            return await this.originalSystem.generateTop10(this.historyBuffer);
        } catch (e) {
            return [];
        }
    }
}

function getInverse(numbers: number[]): number[] {
    const all = Array.from({ length: 50 }, (_, i) => i + 1);
    return all.filter(n => !numbers.includes(n)).slice(0, 25);
}

// --- Main ML Backfill Function ---
async function backfillMLSystems() {
    console.log('\n🔄 Starting ML System Backfill (Post-Training)...');

    // SMART SKIP: Check if backfill is needed
    console.log('🔍 Verificando se backfill ML é necessário...');

    const lastDraw = await prisma.draw.findFirst({
        orderBy: { id: 'desc' },
        select: { id: true }
    });

    const lstmPerf = await prisma.systemPerformance.findFirst({
        where: { systemName: 'LSTM Neural Net' },
        orderBy: { drawId: 'desc' },
        select: { drawId: true }
    });

    if (lstmPerf && lastDraw && lstmPerf.drawId === lastDraw.id) {
        console.log(`✅ ML Systems já atualizados até sorteio #${lastDraw.id}.`);
        console.log('⏩ SKIP: Backfill ML não necessário.\n');
        return; // Skip backfill
    }

    console.log(`📊 Novos dados para processar: sorteio #${lastDraw?.id || 0}`);

    // 1. Load History
    const draws = await prisma.draw.findMany({ orderBy: { date: 'asc' } });
    console.log(`📚 Loaded ${draws.length} draws.`);

    // 2. Define ML Systems to Update
    const systems = [
        new WindowedAdapter(new LSTMModel()),
        new WindowedAdapter(new PredictionModelAdapter(new MLClassifierModel()))
    ];

    for (const system of systems) {
        const sysStart = performance.now();
        console.log(`🤖 Processing: ${system.name}...`);

        // CHECK LAST PROCESSED ID
        const lastPerf = await prisma.systemPerformance.findFirst({
            where: { systemName: system.name },
            orderBy: { drawId: 'desc' },
            select: { drawId: true }
        });
        const lastProcessedId = lastPerf?.drawId || 0;
        console.log(`   └─ Last Processed Draw ID: ${lastProcessedId} ${lastProcessedId > 0 ? '(Skipping history...)' : '(Full Backfill)'}`);

        // Clean FUTURE predictions (Safety)
        await prisma.systemPerformance.deleteMany({
            where: {
                systemName: { in: [system.name, `Anti-${system.name}`] },
                drawId: { gt: lastProcessedId }
            }
        });

        system.reset();
        const perfBuffer: any[] = [];
        const predBuffer: any[] = [];
        let processed = 0;
        let skipped = 0;

        for (const draw of draws) {
            // OPTIMIZATION: Incremental Loading
            if (draw.id <= lastProcessedId) {
                system.update(draw);
                skipped++;
                if (skipped % 100 === 0) process.stdout.write(`\r⏩ Skipping: ${skipped}/${lastProcessedId}`);
                continue;
            }

            const prediction = await system.predictNext();

            // Only save if we have a valid prediction
            if (prediction.length > 0) {
                const antiPrediction = getInverse(prediction);
                const actual = typeof draw.numbers === 'string' ? JSON.parse(draw.numbers) : draw.numbers as number[];
                const hits = actual.filter(n => prediction.includes(n)).length;
                const antiHits = actual.filter(n => antiPrediction.includes(n)).length;

                // Performance Record
                perfBuffer.push({
                    drawId: draw.id,
                    systemName: system.name,
                    predictedNumbers: JSON.stringify(prediction),
                    actualNumbers: draw.numbers,
                    hits,
                    accuracy: (hits / 5) * 100
                });
                perfBuffer.push({
                    drawId: draw.id,
                    systemName: `Anti-${system.name}`,
                    predictedNumbers: JSON.stringify(antiPrediction),
                    actualNumbers: draw.numbers,
                    hits: antiHits,
                    accuracy: (antiHits / 5) * 100
                });

                // Prediction Record
                predBuffer.push({
                    drawId: draw.id,
                    systemName: system.name,
                    prediction: JSON.stringify(prediction),
                    antiPrediction: JSON.stringify(antiPrediction),
                    hits,
                    antiHits,
                    jackpot: hits === 5,
                    antiJackpot: antiHits === 5
                });
                predBuffer.push({
                    drawId: draw.id,
                    systemName: `Anti-${system.name}`,
                    prediction: JSON.stringify(antiPrediction),
                    antiPrediction: JSON.stringify(prediction), // Inverse
                    hits: antiHits,
                    antiHits: hits,
                    jackpot: antiHits === 5,
                    antiJackpot: hits === 5
                });
            }

            system.update(draw);

            // Batch Save
            if (perfBuffer.length >= 50) {
                await prisma.systemPerformance.createMany({ data: perfBuffer });
                perfBuffer.length = 0;
            }
            if (predBuffer.length >= 50) {
                await prisma.systemPrediction.createMany({ data: predBuffer });
                predBuffer.length = 0;
                process.stdout.write(`\r⏳ Progress: ${processed + skipped}/${draws.length} (${(((processed + skipped) / draws.length) * 100).toFixed(1)}%)`);
            }
            processed++;
        }

        // Final Flush
        if (perfBuffer.length > 0) await prisma.systemPerformance.createMany({ data: perfBuffer });
        if (predBuffer.length > 0) await prisma.systemPrediction.createMany({ data: predBuffer });

        const sysEnd = performance.now();
        console.log(` Done (${processed} draws) in ${((sysEnd - sysStart) / 1000).toFixed(2)}s`);
    }
}

// Export for Admin API
export async function runFullMLPipeline() {
    console.log('🚀 Running Full ML Pipeline (Training + Backfill)...');

    // 1. Train Models (Heavy Lifting)
    await trainAllModels();

    // 2. Generate History (Backfill)
    await backfillMLSystems();

    console.log('✨ Full ML Pipeline Complete!');
}

async function main() {
    // Only run if called directly (via CLI)
    // In Vercel, this file might be imported, so we avoid auto-run unless it's the entry point.
    // However, esbuild/next might behave differently. 
    // Checking require.main === module is hard in ES modules/TSX.
    // For now, we just call it. If imported, it might run? 
    // Wait, if I import { runFullMLPipeline } from here, the code at the bottom runs?
    // Yes, usually.
    // Safe guard: check process.argv
    const isCLI = process.argv[1]?.includes('turbo-ml') || process.argv[1]?.includes('tsx');
    if (isCLI) {
        await runFullMLPipeline();
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        // Only disconnect if CLI? Or always?
        // If imported by API, we should probably NOT disconnect the shared prisma instance?
        // But this script imports `prisma` from `@/lib/prisma` which is the shared instance.
        // Disconnecting it might kill the app's connection pool.
        // So we should ONLY disconnect if we know we are done and in a standalone process.
        // Actually, the import creates a singleton.
        // If we disconnect here, the Next.js app might lose connection.
        // FIX: Remove generic disconnect or only do it in CLI mode.
        const isCLI = process.argv[1]?.includes('turbo-ml') || process.argv[1]?.includes('tsx');
        if (isCLI) {
            await prisma.$disconnect();
        }
    });
