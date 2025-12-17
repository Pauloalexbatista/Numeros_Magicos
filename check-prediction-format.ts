import { prisma } from './src/lib/prisma';

/**
 * VERIFICAÇÃO: Como está guardada a previsão?
 * 
 * Vamos ver se a tabela SystemPrediction guarda:
 * - Os 25 números previstos
 * - Ou apenas os hits (acertos)
 */

async function checkPredictionFormat() {
    console.log('🔍 VERIFICAÇÃO: Formato das Previsões\n');
    console.log('═'.repeat(80));

    // Buscar algumas previsões de exemplo
    const samples = await prisma.systemPrediction.findMany({
        where: {
            systemName: 'LSTM Neural Net',
            hits: { gte: 3 }
        },
        take: 5,
        orderBy: { drawId: 'desc' },
        select: {
            drawId: true,
            systemName: true,
            prediction: true,
            hits: true,
            jackpot: true
        }
    });

    console.log('\n📊 Amostras de Previsões (LSTM Neural Net):\n');

    for (const sample of samples) {
        console.log(`Draw ID: ${sample.drawId}`);
        console.log(`Sistema: ${sample.systemName}`);
        console.log(`Hits: ${sample.hits}`);
        console.log(`Jackpot: ${sample.jackpot}`);

        if (sample.prediction) {
            const pred = typeof sample.prediction === 'string'
                ? JSON.parse(sample.prediction)
                : sample.prediction;

            console.log(`Previsão: ${Array.isArray(pred) ? pred.join(', ') : pred}`);
            console.log(`Total de números: ${Array.isArray(pred) ? pred.length : 'N/A'}`);
        } else {
            console.log(`Previsão: NULL`);
        }
        console.log('');
    }

    // Buscar o draw correspondente
    if (samples.length > 0) {
        const draw = await prisma.draw.findUnique({
            where: { id: samples[0].drawId },
            select: { numbers: true }
        });

        if (draw) {
            const drawnNumbers = typeof draw.numbers === 'string'
                ? JSON.parse(draw.numbers)
                : draw.numbers;

            console.log('═'.repeat(80));
            console.log('\n🎯 Comparação com Sorteio Real:\n');
            console.log(`Números Sorteados: ${drawnNumbers.join(', ')}`);

            if (samples[0].prediction) {
                const pred = typeof samples[0].prediction === 'string'
                    ? JSON.parse(samples[0].prediction)
                    : samples[0].prediction;

                if (Array.isArray(pred)) {
                    const matches = pred.filter((n: number) => drawnNumbers.includes(n));
                    console.log(`Números Previstos: ${pred.join(', ')}`);
                    console.log(`Acertos: ${matches.join(', ')} (${matches.length})`);
                }
            }
        }
    }

    console.log('\n' + '═'.repeat(80));
    console.log('\n💡 CONCLUSÃO:\n');
    console.log('   Se a previsão tem 25 números → Análise está CORRETA');
    console.log('   Se a previsão tem >25 números → Análise está ERRADA (cobertura inflacionada)');
    console.log('   Se a previsão é NULL → Precisamos recalcular\n');

    await prisma.$disconnect();
}

checkPredictionFormat()
    .then(() => process.exit(0))
    .catch(error => {
        console.error('\n❌ Erro:', error);
        process.exit(1);
    });
