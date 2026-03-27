import { prisma } from '@/lib/prisma';

/**
 * Script to analyze positional statistics (Elastic System)
 * Shows min, max, average, and range for each position
 */

async function analyzePositionalStats() {
    console.log('📊 ANÁLISE DO SISTEMA ELÁSTICO - AMPLITUDE POR CASA\n');
    console.log('═'.repeat(80));

    // Fetch all draws
    const draws = await prisma.draw.findMany({
        orderBy: { date: 'desc' },
        select: { numbers: true }
    });

    console.log(`Total de sorteios analisados: ${draws.length}\n`);

    // Analyze each position (Casa 1 to Casa 5)
    const positions = 5;
    const stats: Array<{
        position: number;
        min: number;
        max: number;
        avg: number;
        range: number;
        values: number[];
    }> = [];

    for (let pos = 0; pos < positions; pos++) {
        const values: number[] = [];

        draws.forEach(draw => {
            const numbers = typeof draw.numbers === 'string'
                ? (typeof draw.numbers === "string" ? JSON.parse(draw.numbers) : draw.numbers)
                : draw.numbers;

            // Numbers are already sorted in the database
            const sortedNumbers = (numbers as number[]).sort((a, b) => a - b);

            if (sortedNumbers[pos]) {
                values.push(sortedNumbers[pos]);
            }
        });

        const min = Math.min(...values);
        const max = Math.max(...values);
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        const range = max - min;

        stats.push({
            position: pos + 1,
            min,
            max,
            avg,
            range,
            values
        });
    }

    // Display results
    console.log('┌─────────┬─────────┬─────────┬─────────┬───────────┐');
    console.log('│  Casa   │   Min   │   Max   │  Média  │ Amplitude │');
    console.log('├─────────┼─────────┼─────────┼─────────┼───────────┤');

    stats.forEach(stat => {
        console.log(
            `│ Casa ${stat.position}  │   ${stat.min.toString().padStart(2, ' ')}    │   ${stat.max.toString().padStart(2, ' ')}    │  ${stat.avg.toFixed(1).padStart(4, ' ')}   │    ${stat.range.toString().padStart(2, ' ')}     │`
        );
    });

    console.log('└─────────┴─────────┴─────────┴─────────┴───────────┘');

    // Show typical ranges
    console.log('\n📈 INTERVALOS TÍPICOS (onde 90% dos valores caem)\n');

    stats.forEach(stat => {
        // Calculate 5th and 95th percentile
        const sorted = [...stat.values].sort((a, b) => a - b);
        const p5 = sorted[Math.floor(sorted.length * 0.05)];
        const p95 = sorted[Math.floor(sorted.length * 0.95)];

        console.log(`Casa ${stat.position}: ${p5} - ${p95} (90% dos valores)`);
    });

    // Show "elastic" concept
    console.log('\n🔄 CONCEITO DO ELÁSTICO\n');
    console.log('Para cada casa, o número tende a "voltar" para a média:');
    console.log('');

    stats.forEach(stat => {
        console.log(`Casa ${stat.position}:`);
        console.log(`  Média: ${stat.avg.toFixed(1)}`);
        console.log(`  Se último sorteio < ${stat.avg.toFixed(1)} → Próximo tende a SUBIR`);
        console.log(`  Se último sorteio > ${stat.avg.toFixed(1)} → Próximo tende a DESCER`);
        console.log('');
    });

    // Show last draw analysis
    console.log('═'.repeat(80));
    console.log('\n🎯 ANÁLISE DO ÚLTIMO SORTEIO\n');

    const lastDraw = draws[0];
    const lastNumbers = typeof lastDraw.numbers === 'string'
        ? (typeof lastDraw.numbers === "string" ? JSON.parse(lastDraw.numbers) : lastDraw.numbers)
        : lastDraw.numbers;
    const sortedLast = (lastNumbers as number[]).sort((a, b) => a - b);

    console.log('Último sorteio:', sortedLast.join(', '));
    console.log('');

    stats.forEach((stat, idx) => {
        const lastValue = sortedLast[idx];
        const diff = lastValue - stat.avg;
        const direction = diff > 0 ? '↓ DESCER' : diff < 0 ? '↑ SUBIR' : '→ MANTER';
        const force = Math.abs(diff);

        console.log(`Casa ${stat.position}: ${lastValue} (média: ${stat.avg.toFixed(1)})`);
        console.log(`  Diferença: ${diff > 0 ? '+' : ''}${diff.toFixed(1)}`);
        console.log(`  Força do elástico: ${force.toFixed(1)}`);
        console.log(`  Tendência: ${direction}`);
        console.log('');
    });

    // Show prediction based on elastic
    console.log('═'.repeat(80));
    console.log('\n🔮 PREVISÃO BASEADA NO ELÁSTICO\n');

    stats.forEach((stat, idx) => {
        const lastValue = sortedLast[idx];
        const diff = lastValue - stat.avg;

        // Predict: move towards average
        let prediction: string;
        if (diff > 2) {
            prediction = `${Math.floor(lastValue - 2)} - ${Math.floor(lastValue - 1)}`;
        } else if (diff < -2) {
            prediction = `${Math.ceil(lastValue + 1)} - ${Math.ceil(lastValue + 2)}`;
        } else {
            prediction = `${Math.floor(stat.avg - 1)} - ${Math.ceil(stat.avg + 1)}`;
        }

        console.log(`Casa ${stat.position}: ${prediction} (puxado para média ${stat.avg.toFixed(1)})`);
    });

    console.log('\n' + '═'.repeat(80));
}

// Run analysis
analyzePositionalStats()
    .then(() => {
        console.log('\n✅ Análise concluída!');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n❌ Erro:', error);
        process.exit(1);
    });
