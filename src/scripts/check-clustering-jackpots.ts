import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkClusteringJackpots() {
    console.log('🔍 Investigando jackpots do Clustering...\n');

    // Get all Clustering predictions
    const predictions = await prisma.systemPrediction.findMany({
        where: {
            systemName: 'Clustering'
        },
        include: {
            draw: {
                select: {
                    id: true,
                    date: true,
                    numbers: true
                }
            }
        },
        orderBy: {
            drawId: 'asc'
        }
    });

    console.log(`📊 Total de previsões: ${predictions.length}\n`);

    let jackpots = 0;
    const jackpotDraws: any[] = [];

    predictions.forEach(pred => {
        // Parse prediction and actual numbers
        let predNumbers: number[] = [];
        let actualNumbers: number[] = [];

        try {
            predNumbers = typeof pred.prediction === 'string'
                ? JSON.parse(pred.prediction)
                : pred.prediction as any;

            actualNumbers = typeof pred.draw.numbers === 'string'
                ? JSON.parse(pred.draw.numbers)
                : pred.draw.numbers as any;
        } catch (e) {
            return;
        }

        // Count hits
        const hits = actualNumbers.filter(num => predNumbers.includes(num)).length;

        if (hits === 5) {
            jackpots++;
            jackpotDraws.push({
                drawId: pred.drawId,
                date: pred.draw.date,
                actual: actualNumbers,
                predicted: predNumbers.slice(0, 10),
                hits
            });
        }
    });

    console.log(`🎯 Total de Jackpots (5 acertos): ${jackpots}\n`);

    if (jackpotDraws.length > 0) {
        console.log('📋 Primeiros 10 jackpots:\n');
        jackpotDraws.slice(0, 10).forEach((jp, idx) => {
            console.log(`${idx + 1}. Sorteio #${jp.drawId} (${new Date(jp.date).toLocaleDateString('pt-PT')})`);
            console.log(`   Real: [${jp.actual.join(', ')}]`);
            console.log(`   Prev: [${jp.predicted.join(', ')}...]`);
            console.log('');
        });

        console.log(`\n📋 Últimos 10 jackpots:\n`);
        jackpotDraws.slice(-10).forEach((jp, idx) => {
            console.log(`${jackpotDraws.length - 10 + idx + 1}. Sorteio #${jp.drawId} (${new Date(jp.date).toLocaleDateString('pt-PT')})`);
            console.log(`   Real: [${jp.actual.join(', ')}]`);
            console.log(`   Prev: [${jp.predicted.join(', ')}...]`);
            console.log('');
        });
    }

    // Check if first 5 draws have jackpots
    const first5 = predictions.slice(0, 5);
    let first5Jackpots = 0;

    first5.forEach(pred => {
        let predNumbers: number[] = [];
        let actualNumbers: number[] = [];

        try {
            predNumbers = typeof pred.prediction === 'string'
                ? JSON.parse(pred.prediction)
                : pred.prediction as any;

            actualNumbers = typeof pred.draw.numbers === 'string'
                ? JSON.parse(pred.draw.numbers)
                : pred.draw.numbers as any;
        } catch (e) {
            return;
        }

        const hits = actualNumbers.filter(num => predNumbers.includes(num)).length;
        if (hits === 5) first5Jackpots++;
    });

    console.log(`\n🎯 Jackpots nos primeiros 5 sorteios: ${first5Jackpots}`);

    await prisma.$disconnect();
}

checkClusteringJackpots().catch(console.error);
