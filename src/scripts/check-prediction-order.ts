import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkPredictionOrder() {
    console.log('🔍 Verificando ordem dos números em SystemPrediction...\n');

    // Buscar último sorteio
    const lastDraw = await prisma.draw.findFirst({
        orderBy: { date: 'desc' }
    });

    if (!lastDraw) {
        console.log('❌ Nenhum sorteio encontrado!');
        return;
    }

    console.log(`📅 Último sorteio: ${lastDraw.date.toLocaleDateString('pt-PT')}\n`);

    // Buscar previsões de sistemas ensemble
    const ensembleSystems = [
        'Consensus Auto (Vortex + LSTM + Media3)',
        'Consensus Auto (Vortex + Camadas + Media3)',
        'Quarteto de Impacto',
        'Sistema Ouro',
        'Sistema Prata'
    ];

    for (const systemName of ensembleSystems) {
        const pred = await prisma.systemPrediction.findFirst({
            where: {
                drawId: lastDraw.id,
                systemName
            }
        });

        if (pred) {
            const numbers = typeof pred.prediction === 'string'
                ? JSON.parse(pred.prediction)
                : pred.prediction as number[];

            const first10 = numbers.slice(0, 10);

            // Verificar se está ordenado
            const isOrdered = first10.every((num, i) =>
                i === 0 || num > first10[i - 1]
            );

            console.log(`📊 ${systemName}`);
            console.log(`   Top 10: ${first10.join(', ')}`);
            console.log(`   ${isOrdered ? '❌ ORDENADO (errado!)' : '✅ DESORDENADO (correto!)'}\n`);
        } else {
            console.log(`⚠️  ${systemName} - Não encontrado\n`);
        }
    }

    await prisma.$disconnect();
}

checkPredictionOrder().catch(console.error);
