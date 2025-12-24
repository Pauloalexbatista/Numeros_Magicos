import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function showLast10Draws() {
    const systemName = 'Vortex Multi-Canal (2 canais)';

    console.log('═'.repeat(150));
    console.log(`📊 ÚLTIMOS 10 SORTEIOS (1905 → 1896) - ${systemName}`);
    console.log('═'.repeat(150));
    console.log();

    // Get last 10 draws with predictions
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

    console.log('┌─────────┬──────────────┬─────────────────────────────────────────────────────────────────────────┬─────────────────────────────────────────────────────────────────────────┬──────┐');
    console.log('│ Sorteio │     Data     │              Números que Saíram (Resultado Real)                        │                    Predição Feita ANTES                                 │ Hits │');
    console.log('├─────────┼──────────────┼─────────────────────────────────────────────────────────────────────────┼─────────────────────────────────────────────────────────────────────────┼──────┤');

    for (const pred of predictions) {
        const drawId = pred.drawId.toString().padStart(4, ' ');
        const date = pred.draw.date.toLocaleDateString('pt-PT', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });

        const prediction = JSON.parse(pred.prediction);
        const actual = JSON.parse(pred.draw.numbers as string);

        // Format actual numbers (5 numbers) - highlight them
        const actualStr = actual.map((n: number) => `\x1b[1m${n.toString().padStart(2, ' ')}\x1b[0m`).join(', ');

        // Format prediction (25 numbers) - highlight hits in green
        const predStr = prediction.slice(0, 25).map((n: number) => {
            const isHit = actual.includes(n);
            return isHit ? `\x1b[32m${n.toString().padStart(2, ' ')}\x1b[0m` : n.toString().padStart(2, ' ');
        }).join(', ');

        const hits = `${pred.hits}/5`;
        const hitsColored = pred.hits === 5
            ? `\x1b[32m\x1b[1m${hits}\x1b[0m`
            : pred.hits >= 4
                ? `\x1b[33m${hits}\x1b[0m`
                : hits;

        console.log(`│ ${drawId}    │ ${date} │ ${actualStr.padEnd(83)} │ ${predStr.padEnd(83)} │ ${hitsColored.padEnd(17)} │`);
    }

    console.log('└─────────┴──────────────┴─────────────────────────────────────────────────────────────────────────┴─────────────────────────────────────────────────────────────────────────┴──────┘');

    console.log();
    console.log('Legenda: \x1b[32mVerde = Acerto\x1b[0m | \x1b[1mNegrito = Números que saíram\x1b[0m');
    console.log();
    console.log('Nota: A predição foi feita ANTES do sorteio acontecer (usando histórico até o sorteio anterior)');
    console.log();

    // Statistics
    const totalHits = predictions.reduce((sum, p) => sum + p.hits, 0);
    const avgHits = (totalHits / predictions.length).toFixed(2);
    const jackpots = predictions.filter(p => p.hits === 5).length;
    const fourHits = predictions.filter(p => p.hits === 4).length;

    console.log('═'.repeat(150));
    console.log('📈 ESTATÍSTICAS DOS ÚLTIMOS 10 SORTEIOS:');
    console.log('═'.repeat(150));
    console.log(`Total de Acertos: ${totalHits}/50 (${((totalHits / 50) * 100).toFixed(1)}%)`);
    console.log(`Média por Sorteio: ${avgHits} acertos`);
    console.log(`Jackpots (5/5): ${jackpots}`);
    console.log(`Muito Bom (4/5): ${fourHits}`);
    console.log(`Bom (3/5): ${predictions.filter(p => p.hits === 3).length}`);
    console.log('═'.repeat(150));
    console.log();

    await prisma.$disconnect();
}

showLast10Draws().catch(console.error);
