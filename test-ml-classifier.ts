/**
 * TEST ML CLASSIFIER
 * Script para testar se o ML Classifier gera predições
 */

import { PrismaClient } from '@prisma/client';
import { MLClassifierModel } from './src/models/implementations/MLClassifierModel';

const prisma = new PrismaClient();

async function testMLClassifier() {
    console.log('🧪 TESTE ML CLASSIFIER\n');

    // Carregar histórico
    const draws = await prisma.draw.findMany({
        orderBy: { date: 'desc' },
        take: 200
    });

    console.log(`📚 Carregados ${draws.length} sorteios\n`);

    // Criar modelo
    const model = new MLClassifierModel();
    console.log(`🤖 Modelo: ${model.name}\n`);

    // Tentar gerar predição
    console.log('🔮 Gerando predição...\n');

    try {
        const result = model.predict(draws, 25);

        console.log('✅ Resultado:');
        console.log(`   Números: ${result.numbers.length} números`);
        console.log(`   Números: [${result.numbers.join(', ')}]`);
        console.log(`   Reasoning: ${result.reasoning}`);
    } catch (error) {
        console.error('❌ Erro:', error);
    }

    await prisma.$disconnect();
}

testMLClassifier();
