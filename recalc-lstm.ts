/**
 * RECALCULAÇÃO LSTM NEURAL NET
 * Script específico para recalcular apenas LSTM com lógica predict-for-next correta
 */

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import { Draw } from '@prisma/client';
import { LSTMModel } from './src/services/ml/lstm';

// Adapter para usar sistema antigo
class WindowedAdapter {
    name: string;
    private originalSystem: any;
    private historyBuffer: Draw[] = [];
    private windowSize = 100;

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
        if (this.historyBuffer.length < 5) return [];
        try {
            return await this.originalSystem.generateTop10(this.historyBuffer);
        } catch (e) {
            console.error(`Erro ao gerar predição: ${e}`);
            return [];
        }
    }
}

function getInverse(numbers: number[]): number[] {
    const all = Array.from({ length: 50 }, (_, i) => i + 1);
    return all.filter(n => !numbers.includes(n)).slice(0, 25);
}

function parseNumbers(draw: Draw): number[] {
    if (typeof draw.numbers === 'string') {
        return JSON.parse(draw.numbers);
    }
    return draw.numbers as unknown as number[];
}

async function recalculateLSTM() {
    console.log('🧠 RECALCULAÇÃO LSTM NEURAL NET');
    console.log('='.repeat(80));

    const startTime = performance.now();

    // 1. Verificar se sistema está registado
    await prisma.rankedSystem.upsert({
        where: { name: 'LSTM Neural Net' },
        update: {},
        create: {
            name: 'LSTM Neural Net',
            description: 'Rede Neuronal Profunda (TensorFlow) com memória de longo prazo',
            isActive: true
        }
    });

    await prisma.rankedSystem.upsert({
        where: { name: 'Anti-LSTM Neural Net' },
        update: {},
        create: {
            name: 'Anti-LSTM Neural Net',
            description: 'Anti-LSTM Neural Net (Auto-generated)',
            isActive: true
        }
    });

    // 2. Carregar histórico
    console.log('\n📚 Carregando histórico...');
    const draws = await prisma.draw.findMany({
        orderBy: { date: 'asc' }
    });
    console.log(`   Carregados ${draws.length} sorteios`);

    // 3. Criar sistema
    const system = new WindowedAdapter(new LSTMModel());
    console.log(`\n🤖 Sistema: ${system.name}`);

    // 4. Verificar último processado
    const lastPerf = await prisma.systemPerformance.findFirst({
        where: { systemName: system.name },
        orderBy: { drawId: 'desc' },
        select: { drawId: true }
    });
    const lastProcessedId = lastPerf?.drawId || 0;
    console.log(`   Último processado: Draw ID ${lastProcessedId}`);

    // 5. Limpar dados futuros (segurança)
    await prisma.systemPerformance.deleteMany({
        where: {
            systemName: { in: [system.name, `Anti-${system.name}`] },
            drawId: { gt: lastProcessedId }
        }
    });
    await prisma.systemPrediction.deleteMany({
        where: {
            systemName: { in: [system.name, `Anti-${system.name}`] },
            drawId: { gt: lastProcessedId }
        }
    });

    // 6. Processar
    system.reset();
    const perfBuffer: any[] = [];
    const predBuffer: any[] = [];
    let processed = 0;
    let skipped = 0;

    console.log('\n🔄 Processando...\n');

    for (let i = 0; i < draws.length; i++) {
        const draw = draws[i];
        const nextDraw = draws[i + 1]; // O sorteio que estamos a prever

        // SKIP: Se já processado, apenas atualizar estado interno
        if (draw.id <= lastProcessedId) {
            system.update(draw);
            skipped++;
            if (skipped % 100 === 0) {
                process.stdout.write(`\r⏩ Saltados: ${skipped}/${lastProcessedId}`);
            }
            continue;
        }

        // Atualizar estado com sorteio atual
        system.update(draw);

        // Se não há próximo sorteio, parar
        if (!nextDraw) {
            continue;
        }

        // --- PREDICT FOR NEXT ---
        const prediction = await system.predictNext();

        if (prediction.length === 0) {
            console.log(`\n⚠️  Sem predição para draw ${draw.id} (histórico insuficiente ou modelo não treinado)`);
            continue;
        }

        const antiPrediction = getInverse(prediction);
        const nextActual = parseNumbers(nextDraw);
        const hits = nextActual.filter(n => prediction.includes(n)).length;
        const antiHits = nextActual.filter(n => antiPrediction.includes(n)).length;

        // Guardar Performance (para NEXT draw)
        perfBuffer.push({
            drawId: nextDraw.id,
            systemName: system.name,
            predictedNumbers: JSON.stringify(prediction),
            actualNumbers: nextDraw.numbers,
            hits,
            accuracy: (hits / 5) * 100
        });
        perfBuffer.push({
            drawId: nextDraw.id,
            systemName: `Anti-${system.name}`,
            predictedNumbers: JSON.stringify(antiPrediction),
            actualNumbers: nextDraw.numbers,
            hits: antiHits,
            accuracy: (antiHits / 5) * 100
        });

        // Guardar Prediction (para NEXT draw)
        predBuffer.push({
            drawId: nextDraw.id,
            systemName: system.name,
            prediction: JSON.stringify(prediction),
            antiPrediction: JSON.stringify(antiPrediction),
            hits,
            antiHits,
            jackpot: hits === 5,
            antiJackpot: antiHits === 5
        });
        predBuffer.push({
            drawId: nextDraw.id,
            systemName: `Anti-${system.name}`,
            prediction: JSON.stringify(antiPrediction),
            antiPrediction: JSON.stringify(prediction),
            hits: antiHits,
            antiHits: hits,
            jackpot: antiHits === 5,
            antiJackpot: hits === 5
        });

        // Batch save
        if (perfBuffer.length >= 50) {
            await prisma.systemPerformance.createMany({ data: perfBuffer });
            perfBuffer.length = 0;
        }
        if (predBuffer.length >= 50) {
            await prisma.systemPrediction.createMany({ data: predBuffer });
            predBuffer.length = 0;
            process.stdout.write(`\r✅ Processados: ${processed}/${draws.length - lastProcessedId - 1} (${hits}/5 acertos no último)`);
        }
        processed++;
    }

    // Final flush
    if (perfBuffer.length > 0) {
        await prisma.systemPerformance.createMany({ data: perfBuffer });
    }
    if (predBuffer.length > 0) {
        await prisma.systemPrediction.createMany({ data: predBuffer });
    }

    const endTime = performance.now();
    console.log(`\n\n✅ LSTM Neural Net Concluído!`);
    console.log(`   Saltados: ${skipped}`);
    console.log(`   Calculados: ${processed}`);
    console.log(`   Tempo: ${((endTime - startTime) / 1000).toFixed(2)}s`);

    await prisma.$disconnect();
}

recalculateLSTM().catch(console.error);
