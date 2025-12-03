import { prisma } from '../lib/prisma';

async function main() {
    console.log('📋 DETALHE: Números por Casa (Média ±3 + Filtro Elástico)\n');

    const allDraws = await prisma.draw.findMany({
        orderBy: { date: 'asc' }
    });

    const parsedDraws = allDraws.map(d => ({
        numbers: JSON.parse(d.numbers) as number[]
    }));

    const history = parsedDraws.slice(0, -1);
    const recent50 = history.slice(-50);
    const lastDraw = history[history.length - 1].numbers;

    console.log(`Último sorteio: ${lastDraw.join(', ')}\n`);

    const means = [0, 0, 0, 0, 0].map((_, pos) =>
        recent50.reduce((sum, d) => sum + d.numbers[pos], 0) / 50
    );

    let totalCandidates = 0;
    let totalFiltered = 0;

    for (let pos = 0; pos < 5; pos++) {
        const values = recent50.map(d => d.numbers[pos]);
        const mean = values.reduce((a, b) => a + b, 0) / values.length;

        // Generate candidates
        const candidates = [];
        for (let offset = -3; offset <= 3; offset++) {
            const num = Math.round(mean) + offset;
            if (num >= 1 && num <= 50) {
                candidates.push(num);
            }
        }

        totalCandidates += candidates.length;

        // Filter by elastic direction
        const lastVal = lastDraw[pos];
        const elasticMean = means[pos];

        let direction = 'NEUTRAL';
        let filtered = candidates;

        if (lastVal < elasticMean) {
            direction = 'UP ⬆️';
            filtered = candidates.filter(n => n >= lastVal);
        } else if (lastVal > elasticMean) {
            direction = 'DOWN ⬇️';
            filtered = candidates.filter(n => n <= lastVal);
        }

        totalFiltered += filtered.length;

        console.log(`Casa ${pos + 1}:`);
        console.log(`  Média: ${mean.toFixed(1)}`);
        console.log(`  Candidatos (${candidates.length}): ${candidates.join(', ')}`);
        console.log(`  Último: ${lastVal} | Média elástica: ${elasticMean.toFixed(1)} | Direção: ${direction}`);
        console.log(`  FILTRADOS (${filtered.length}): ${filtered.join(', ')}`);
        console.log('');
    }

    console.log('='.repeat(70));
    console.log(`Total de candidatos (antes filtro): ${totalCandidates}`);
    console.log(`Total após união por casa: ${totalFiltered}`);

    // Calculate unique after union
    const allFiltered = new Set<number>();

    for (let pos = 0; pos < 5; pos++) {
        const values = recent50.map(d => d.numbers[pos]);
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const candidates = [];

        for (let offset = -3; offset <= 3; offset++) {
            const num = Math.round(mean) + offset;
            if (num >= 1 && num <= 50) candidates.push(num);
        }

        const lastVal = lastDraw[pos];
        const elasticMean = means[pos];
        let filtered = candidates;

        if (lastVal < elasticMean) {
            filtered = candidates.filter(n => n >= lastVal);
        } else if (lastVal > elasticMean) {
            filtered = candidates.filter(n => n <= lastVal);
        }

        filtered.forEach(n => allFiltered.add(n));
    }

    console.log(`Total ÚNICOS (união): ${allFiltered.size}`);
    console.log(`\n📊 O problema:`);
    console.log(`  Queremos: ~25 números`);
    console.log(`  Temos: ${allFiltered.size} números`);
    console.log(`  Sobram: ${allFiltered.size - 25} números a mais`);
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
