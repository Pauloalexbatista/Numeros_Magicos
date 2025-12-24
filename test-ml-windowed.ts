/**
 * TEST ML CLASSIFIER COM WINDOWED ADAPTER
 * Simula exatamente como o turbo-backfill usa o ML Classifier
 */

import { PrismaClient, Draw } from '@prisma/client';
import { MLClassifierModel } from './src/models/implementations/MLClassifierModel';
import { PredictionModelAdapter } from './src/services/ranked-systems';

const prisma = new PrismaClient();

// WindowedAdapter (copiado do turbo-backfill)
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
            console.error('Erro ao gerar predição:', e);
            return [];
        }
    }
}

async function testWithAdapter() {
    console.log('🧪 TESTE ML CLASSIFIER COM WINDOWED ADAPTER\n');

    // Carregar sorteios
    const draws = await prisma.draw.findMany({
        orderBy: { date: 'asc' }
    });

    console.log(`📚 Carregados ${draws.length} sorteios\n`);

    // Criar sistema exatamente como no turbo-backfill
    const system = new WindowedAdapter(new PredictionModelAdapter(new MLClassifierModel()));

    console.log(`🤖 Sistema: ${system.name}\n`);

    // Simular processamento
    system.reset();

    // Adicionar primeiros 150 sorteios ao buffer
    for (let i = 0; i < Math.min(150, draws.length); i++) {
        system.update(draws[i]);
    }

    console.log(`📊 Buffer: ${(system as any).historyBuffer.length} sorteios\n`);

    // Tentar gerar predição
    console.log('🔮 Gerando predição...\n');

    const prediction = await system.predictNext();

    console.log('✅ Resultado:');
    console.log(`   Números: ${prediction.length} números`);
    if (prediction.length > 0) {
        console.log(`   Números: [${prediction.slice(0, 10).join(', ')}...]`);
    } else {
        console.log('   ❌ ARRAY VAZIO!');
    }

    await prisma.$disconnect();
}

testWithAdapter();
