import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function showVortexPredictions() {
    const systemName = 'Vortex Multi-Canal (2 canais)';

    console.log('═'.repeat(120));
    console.log(`📊 ÚLTIMOS 10 SORTEIOS - ${systemName}`);
    console.log('═'.repeat(120));
    console.log();

    // Get last 10 predictions with draw data
    const predictions = await prisma.systemPrediction.findMany({
        where: { systemName },
        orderBy: { drawId: 'desc' },
        take: 10,
        include: {
            draw: true
        }
    });

    if (predictions.length === 0) {
        console.log('❌ No predictions found!');
        await prisma.$disconnect();
        return;
    }

    // Reverse to show oldest first
    predictions.reverse();

    console.log('┌─────────┬──────────────┬────────────────────────────────────────────────────┬────────────────────────────────────────────────────┬──────┐');
    console.log('│ Sorteio │     Data     │                    Predição                        │                 Resultado Real                     │ Hits │');
    console.log('├─────────┼──────────────┼────────────────────────────────────────────────────┼────────────────────────────────────────────────────┼──────┤');

    for (const pred of predictions) {
        const drawId = pred.drawId.toString().padStart(4, ' ');
        const date = pred.draw.date.toLocaleDateString('pt-PT', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });

        const prediction = JSON.parse(pred.prediction);
        const actual = JSON.parse(pred.draw.numbers as string);

        // Format prediction (first 25 numbers)
        const predStr = prediction.slice(0, 25).map((n: number) => {
            const isHit = actual.includes(n);
            return isHit ? `\x1b[32m${n.toString().padStart(2, ' ')}\x1b[0m` : n.toString().padStart(2, ' ');
        }).join(',');

        // Format actual (5 numbers)
        const actualStr = actual.map((n: number) => n.toString().padStart(2, ' ')).join(',');

        const hits = `${pred.hits}/5`;
        const hitsColored = pred.hits === 5
            ? `\x1b[32m${hits}\x1b[0m`
            : pred.hits >= 4
                ? `\x1b[33m${hits}\x1b[0m`
                : hits;

        console.log(`│ ${drawId}    │ ${date} │ ${predStr} │ ${actualStr.padEnd(50)} │ ${hitsColored.padEnd(11)} │`);
    }

    console.log('└─────────┴──────────────┴────────────────────────────────────────────────────┴────────────────────────────────────────────────────┴──────┘');

    // Get the next prediction from CachedPrediction
    console.log();
    console.log('═'.repeat(120));
    console.log('🔮 PREDIÇÃO PARA O PRÓXIMO SORTEIO');
    console.log('═'.repeat(120));

    const cachedPred = await prisma.cachedPrediction.findUnique({
        where: { systemName }
    });

    if (cachedPred) {
        const nextPrediction = JSON.parse(cachedPred.numbers);
        console.log();
        console.log(`Sistema: ${systemName}`);
        console.log(`Atualizado: ${cachedPred.updatedAt.toLocaleString('pt-PT')}`);
        console.log();
        console.log('Números previstos (25):');
        console.log(nextPrediction.map((n: number) => n.toString().padStart(2, '0')).join(', '));
        console.log();
    } else {
        console.log('❌ No cached prediction found!');
    }

    console.log('═'.repeat(120));
    console.log();
    console.log('Legenda: \x1b[32mVerde = Acerto\x1b[0m');
    console.log();

    await prisma.$disconnect();
}

showVortexPredictions().catch(console.error);
