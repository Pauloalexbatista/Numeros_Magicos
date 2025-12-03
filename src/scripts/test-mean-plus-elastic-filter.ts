import { prisma } from '../lib/prisma';

async function main() {
    console.log('🔬 TESTE: Média ±5 + Filtro Elástico (74%)\n');

    const allDraws = await prisma.draw.findMany({
        orderBy: { date: 'asc' }
    });

    const parsedDraws = allDraws.map(d => JSON.parse(d.numbers) as number[]);

    let hybridHits = 0;
    let totalTests = 0;

    const testStart = Math.max(100, parsedDraws.length - 100);

    for (let i = testStart; i < parsedDraws.length; i++) {
        const history = parsedDraws.slice(0, i);
        if (history.length < 50) continue;

        const recent50 = history.slice(-50);
        const lastDraw = history[history.length - 1];

        // STEP 1: Generate candidates using Mean ±5 per position
        const candidatesByPosition: number[][] = [[], [], [], [], []];

        for (let pos = 0; pos < 5; pos++) {
            const values = recent50.map(d => d[pos]);
            const mean = values.reduce((a, b) => a + b, 0) / values.length;

            for (let offset = -5; offset <= 5; offset++) {
                const num = Math.round(mean) + offset;
                if (num >= 1 && num <= 50) {
                    candidatesByPosition[pos].push(num);
                }
            }
        }

        // STEP 2: Calculate Elastic Direction for each position
        const means = [0, 0, 0, 0, 0].map((_, pos) =>
            recent50.reduce((sum, d) => sum + d[pos], 0) / 50
        );

        const lastNumbers = JSON.parse(lastDraw.numbers) as number[];

        // STEP 3: Filter candidates by elastic direction
        const filteredByPosition: number[][] = [[], [], [], [], []];

        for (let pos = 0; pos < 5; pos++) {
            const lastVal = lastNumbers[pos];
            const mean = means[pos];
            const candidates = candidatesByPosition[pos];

            if (lastVal < mean) {
                // Should go UP: accept numbers >= lastVal
                filteredByPosition[pos] = candidates.filter(n => n >= lastVal);
            } else if (lastVal > mean) {
                // Should go DOWN: accept numbers <= lastVal
                filteredByPosition[pos] = candidates.filter(n => n <= lastVal);
            } else {
                // Equal: accept all
                filteredByPosition[pos] = candidates;
            }
        }

        // STEP 4: Union of all filtered numbers
        const finalPrediction = [...new Set(filteredByPosition.flat())];

        const actual = parsedDraws[i];
        const hits = actual.filter(n => finalPrediction.includes(n)).length;

        hybridHits += hits;
        totalTests++;
    }

    const accuracy = (hybridHits / (totalTests * 5)) * 100;

    console.log('='.repeat(70));
    console.log('📊 RESULTADO: Média ±5 + Filtro Elástico');
    console.log('='.repeat(70));
    console.log(`Total testes: ${totalTests}`);
    console.log(`Total hits: ${hybridHits}/${totalTests * 5}`);
    console.log(`Acerto: ${accuracy.toFixed(1)}%`);

    console.log(`\n💡 Comparação:`);
    console.log(`   Baseline: 50%`);
    console.log(`   Média ±2 simples: 49.8%`);
    console.log(`   Standard Deviation: 54.2%`);
    console.log(`   Este híbrido: ${accuracy.toFixed(1)}%`);

    if (accuracy > 54) {
        console.log(`\n   🏆 NOVO RECORDE! (+${(accuracy - 54.2).toFixed(1)}% vs StdDev)`);
    } else if (accuracy > 50) {
        console.log(`\n   ✅ Melhor que baseline (+${(accuracy - 50).toFixed(1)}%)`);
    } else {
        console.log(`\n   ⚠️ Pior que baseline`);
    }

    // Show example
    console.log(`\n📋 Exemplo (próximo sorteio):`);
    const history = parsedDraws;
    const recent50 = history.slice(-50);
    const lastDraw = history[history.length - 1];
    const lastNumbers = lastDraw;

    const means = [0, 0, 0, 0, 0].map((_, pos) =>
        recent50.reduce((sum, d) => sum + d[pos], 0) / 50
    );

    for (let pos = 0; pos < 5; pos++) {
        const values = recent50.map(d => d[pos]);
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const lastVal = lastNumbers[pos];
        const elasticMean = means[pos];

        const candidates = [];
        for (let offset = -5; offset <= 5; offset++) {
            const num = Math.round(mean) + offset;
            if (num >= 1 && num <= 50) candidates.push(num);
        }

        let direction = 'NEUTRAL';
        let filtered = candidates;

        if (lastVal < elasticMean) {
            direction = 'UP';
            filtered = candidates.filter(n => n >= lastVal);
        } else if (lastVal > elasticMean) {
            direction = 'DOWN';
            filtered = candidates.filter(n => n <= lastVal);
        }

        console.log(`\n   Casa ${pos + 1}:`);
        console.log(`      Média: ${mean.toFixed(1)} | Candidatos: ${candidates.join(',')}`);
        console.log(`      Último: ${lastVal} | Direção: ${direction}`);
        console.log(`      Filtrados: ${filtered.join(',')}`);
    }
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
