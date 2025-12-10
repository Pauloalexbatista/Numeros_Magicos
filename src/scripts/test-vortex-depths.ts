import { prisma } from '@/lib/prisma';
import { VortexPyramidSystem } from '@/services/vortex-pyramid';

/**
 * Test different Vortex depths to find optimal configuration
 * Test depths: 30, 50, 75, 100, 150, 200 draws
 */

async function testVortexDepths() {
    console.log('🌀 TESTE DE PROFUNDIDADES DO VORTEX PYRAMID\n');
    console.log('═'.repeat(80));

    const allDraws = await prisma.draw.findMany({
        orderBy: { date: 'desc' },
        select: { id: true, date: true, numbers: true }
    });

    console.log(`Total de sorteios disponíveis: ${allDraws.length}\n`);

    const depths = [30, 50, 75, 100, 150, 200];
    const testSize = 100;

    const results: Record<number, {
        vortexHits: number;
        antiVortexHits: number;
        vortexJackpots: number;
        antiVortexJackpots: number;
    }> = {};

    console.log('🔄 Testando diferentes profundidades...\n');

    for (const depth of depths) {
        console.log(`Testando profundidade: ${depth} sorteios...`);

        results[depth] = {
            vortexHits: 0,
            antiVortexHits: 0,
            vortexJackpots: 0,
            antiVortexJackpots: 0
        };

        const vortex = new VortexPyramidSystem();

        for (let i = depth; i < Math.min(allDraws.length - 1, depth + testSize); i++) {
            const history = allDraws.slice(i + 1, i + 1 + depth);
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

            results[depth].vortexHits += vortexHits;
            results[depth].antiVortexHits += antiVortexHits;

            // Count jackpots (5/5)
            if (vortexHits === 5) results[depth].vortexJackpots++;
            if (antiVortexHits === 5) results[depth].antiVortexJackpots++;
        }
    }

    // Display results
    console.log('\n' + '═'.repeat(80));
    console.log('\n📊 RESULTADOS POR PROFUNDIDADE\n');

    console.log('┌────────────┬──────────────┬──────────────┬──────────────┬──────────────┐');
    console.log('│ Profund.   │ Vortex Prec. │ Anti Prec.   │ Vortex JP    │ Anti JP      │');
    console.log('├────────────┼──────────────┼──────────────┼──────────────┼──────────────┤');

    depths.forEach(depth => {
        const r = results[depth];
        const vortexAcc = (r.vortexHits / (testSize * 5)) * 100;
        const antiVortexAcc = (r.antiVortexHits / (testSize * 5)) * 100;

        const depthStr = `${depth} draws`.padEnd(10, ' ');
        const vortexStr = `${vortexAcc.toFixed(1)}%`.padStart(12, ' ');
        const antiStr = `${antiVortexAcc.toFixed(1)}%`.padStart(12, ' ');
        const vortexJP = r.vortexJackpots.toString().padStart(12, ' ');
        const antiJP = r.antiVortexJackpots.toString().padStart(12, ' ');

        console.log(`│ ${depthStr} │ ${vortexStr} │ ${antiStr} │ ${vortexJP} │ ${antiJP} │`);
    });

    console.log('└────────────┴──────────────┴──────────────┴──────────────┴──────────────┘');

    // Find best configurations
    console.log('\n🏆 MELHORES CONFIGURAÇÕES\n');

    // Best for Anti-Vortex jackpots
    const bestAntiJackpots = depths.reduce((best, depth) =>
        results[depth].antiVortexJackpots > results[best].antiVortexJackpots ? depth : best
        , depths[0]);

    console.log(`Melhor para Anti-Vortex Jackpots: ${bestAntiJackpots} draws`);
    console.log(`  Jackpots: ${results[bestAntiJackpots].antiVortexJackpots}`);
    console.log(`  Precisão: ${((results[bestAntiJackpots].antiVortexHits / (testSize * 5)) * 100).toFixed(1)}%`);

    // Best for Anti-Vortex accuracy
    const bestAntiAccuracy = depths.reduce((best, depth) =>
        results[depth].antiVortexHits > results[best].antiVortexHits ? depth : best
        , depths[0]);

    console.log(`\nMelhor para Anti-Vortex Precisão: ${bestAntiAccuracy} draws`);
    console.log(`  Precisão: ${((results[bestAntiAccuracy].antiVortexHits / (testSize * 5)) * 100).toFixed(1)}%`);
    console.log(`  Jackpots: ${results[bestAntiAccuracy].antiVortexJackpots}`);

    // Best for Vortex accuracy
    const bestVortexAccuracy = depths.reduce((best, depth) =>
        results[depth].vortexHits > results[best].vortexHits ? depth : best
        , depths[0]);

    console.log(`\nMelhor para Vortex Precisão: ${bestVortexAccuracy} draws`);
    console.log(`  Precisão: ${((results[bestVortexAccuracy].vortexHits / (testSize * 5)) * 100).toFixed(1)}%`);
    console.log(`  Jackpots: ${results[bestVortexAccuracy].vortexJackpots}`);

    // Recommendation
    console.log('\n💡 RECOMENDAÇÃO\n');

    const currentDepth = 100; // Current implementation uses all history
    const currentAntiJP = results[currentDepth]?.antiVortexJackpots || 0;
    const bestAntiJP = results[bestAntiJackpots].antiVortexJackpots;

    if (bestAntiJackpots !== currentDepth && bestAntiJP > currentAntiJP) {
        console.log(`✅ MUDAR profundidade de ${currentDepth} para ${bestAntiJackpots} draws`);
        console.log(`   Ganho: +${bestAntiJP - currentAntiJP} jackpots`);
    } else {
        console.log(`⚠️  Profundidade atual (${currentDepth}) já é ótima`);
    }

    console.log('\n' + '═'.repeat(80));
}

testVortexDepths()
    .then(() => {
        console.log('\n✅ Teste concluído!');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n❌ Erro:', error);
        process.exit(1);
    });
