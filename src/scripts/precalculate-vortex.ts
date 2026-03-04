import { prisma } from '../lib/prisma';
import { VortexPyramidSystem } from '../services/vortex-pyramid';

/**
 * Pre-calculate Vortex and Anti-Vortex predictions for ALL draws
 * Save to JSON file for fast analysis
 */

interface VortexPredictions {
    drawId: number;
    date: string;
    actualNumbers: number[];
    vortexPrediction: number[];
    antiVortexPrediction: number[];
    vortexHits: number;
    antiVortexHits: number;
    vortexJackpot: boolean;
    antiVortexJackpot: boolean;
}

async function preCalculateVortexPredictions() {
    console.log('🌀 PRÉ-CÁLCULO DE PREVISÕES VORTEX\n');
    console.log('═'.repeat(80));

    const allDraws = await prisma.draw.findMany({
        where: { game: 'EUROMILLIONS' },
        orderBy: { date: 'desc' },
        select: { id: true, date: true, numbers: true }
    }) as any[];

    console.log(`Total de sorteios: ${allDraws.length}`);
    console.log('Calculando previsões para todos...\n');

    const vortex = new VortexPyramidSystem();
    const predictions: VortexPredictions[] = [];

    let processed = 0;
    const total = allDraws.length - 100; // Need 100 draws history

    for (let i = 0; i < allDraws.length - 100; i++) {
        const history = allDraws.slice(i + 1, i + 101);
        const actualDraw = allDraws[i];
        const actualNumbers = typeof actualDraw.numbers === 'string'
            ? JSON.parse(actualDraw.numbers)
            : actualDraw.numbers;

        // Get Vortex prediction
        const vortexPred = await vortex.generateTop10(history as any[]);

        // Anti-Vortex
        const allNums = Array.from({ length: 50 }, (_, i) => i + 1);
        const antiVortexPred = allNums.filter(n => !vortexPred.includes(n)).slice(0, 25);

        // Count hits
        const vortexHits = vortexPred.filter(n => actualNumbers.includes(n)).length;
        const antiVortexHits = antiVortexPred.filter(n => actualNumbers.includes(n)).length;

        predictions.push({
            drawId: actualDraw.id,
            date: new Date(actualDraw.date).toISOString(),
            actualNumbers: actualNumbers as number[],
            vortexPrediction: vortexPred,
            antiVortexPrediction: antiVortexPred,
            vortexHits,
            antiVortexHits,
            vortexJackpot: vortexHits === 5,
            antiVortexJackpot: antiVortexHits === 5
        });

        processed++;
        if (processed % 100 === 0) {
            console.log(`Processados: ${processed}/${total} (${((processed / total) * 100).toFixed(1)}%)`);
        }
    }

    console.log(`\n✅ Processados: ${processed}/${total} sorteios`);

    // Save to JSON file
    const fs = require('fs');
    const path = require('path');

    const outputPath = path.join(process.cwd(), 'data', 'vortex-predictions.json');

    // Create data directory if doesn't exist
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, JSON.stringify(predictions, null, 2));

    console.log(`\n💾 Guardado em: ${outputPath}`);
    console.log(`   Tamanho: ${(fs.statSync(outputPath).size / 1024 / 1024).toFixed(2)} MB`);

    // Quick stats
    console.log('\n📊 ESTATÍSTICAS RÁPIDAS\n');

    const vortexJackpots = predictions.filter(p => p.vortexJackpot).length;
    const antiVortexJackpots = predictions.filter(p => p.antiVortexJackpot).length;

    const vortexTotalHits = predictions.reduce((sum, p) => sum + p.vortexHits, 0);
    const antiVortexTotalHits = predictions.reduce((sum, p) => sum + p.antiVortexHits, 0);

    const vortexPrecision = (vortexTotalHits / (predictions.length * 5)) * 100;
    const antiVortexPrecision = (antiVortexTotalHits / (predictions.length * 5)) * 100;

    console.log(`Total de sorteios analisados: ${predictions.length}`);
    console.log('');
    console.log(`Vortex Pyramid:`);
    console.log(`  Jackpots: ${vortexJackpots} (${((vortexJackpots / predictions.length) * 100).toFixed(1)}%)`);
    console.log(`  Precisão: ${vortexPrecision.toFixed(1)}%`);
    console.log('');
    console.log(`Anti-Vortex Pyramid:`);
    console.log(`  Jackpots: ${antiVortexJackpots} (${((antiVortexJackpots / predictions.length) * 100).toFixed(1)}%)`);
    console.log(`  Precisão: ${antiVortexPrecision.toFixed(1)}%`);

    console.log('\n' + '═'.repeat(80));
    console.log('\n✅ Agora podes fazer análises INSTANTÂNEAS!');
    console.log('   Usa: data/vortex-predictions.json');
}

preCalculateVortexPredictions()
    .then(() => {
        console.log('\n✅ Pré-cálculo concluído!');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n❌ Erro:', error);
        process.exit(1);
    });
