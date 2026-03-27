import { prisma } from '@/lib/prisma';
import { HybridMediaVortex } from '@/services/custom/HybridMediaVortex';
import { SistMediaCamadas } from '@/services/custom/SistMediaCamadas';
import { VortexPyramidSystem } from '@/services/vortex-pyramid';

/**
 * Test Hybrid System vs Individual Systems
 */

async function testHybridSystem() {
    console.log('🧪 TESTE DO SISTEMA HÍBRIDO\n');
    console.log('═'.repeat(80));

    // Fetch draws
    const allDraws = await prisma.draw.findMany({
        orderBy: { date: 'desc' },
        select: { id: true, date: true, numbers: true }
    });

    console.log(`Total de sorteios: ${allDraws.length}\n`);

    if (allDraws.length < 51) {
        console.log('❌ Não há sorteios suficientes');
        return;
    }

    // Initialize systems
    const hybridSystem = new HybridMediaVortex();
    const mediaSystem = new SistMediaCamadas();
    const vortexSystem = new VortexPyramidSystem();

    // Test on 100 draws
    const testSize = 100;

    const results = {
        hybrid: { hits: 0, total: 0 },
        media: { hits: 0, total: 0 },
        vortex: { hits: 0, total: 0 },
        antiVortex: { hits: 0, total: 0 }
    };

    console.log('🔄 Testando em 100 sorteios...\n');

    for (let i = 50; i < Math.min(allDraws.length - 1, 50 + testSize); i++) {
        const history = allDraws.slice(i + 1, i + 51);
        const actualDraw = allDraws[i];
        const actualNumbers = typeof actualDraw.numbers === 'string'
            ? (typeof actualDraw.numbers === "string" ? JSON.parse(actualDraw.numbers) : actualDraw.numbers)
            : actualDraw.numbers;

        // Get predictions
        const hybridPred = await hybridSystem.generateTop10(history as any[]);
        const mediaPred = await mediaSystem.generateTop10(history as any[]);
        const vortexPred = await vortexSystem.generateTop10(history as any[]);

        // Anti-Vortex
        const allNums = Array.from({ length: 50 }, (_, i) => i + 1);
        const antiVortexPred = allNums.filter(n => !vortexPred.includes(n)).slice(0, 25);

        // Count hits
        const hybridHits = hybridPred.filter(n => actualNumbers.includes(n)).length;
        const mediaHits = mediaPred.filter(n => actualNumbers.includes(n)).length;
        const vortexHits = vortexPred.filter(n => actualNumbers.includes(n)).length;
        const antiVortexHits = antiVortexPred.filter(n => actualNumbers.includes(n)).length;

        results.hybrid.hits += hybridHits;
        results.hybrid.total += 5;

        results.media.hits += mediaHits;
        results.media.total += 5;

        results.vortex.hits += vortexHits;
        results.vortex.total += 5;

        results.antiVortex.hits += antiVortexHits;
        results.antiVortex.total += 5;
    }

    // Calculate accuracies
    const hybridAcc = (results.hybrid.hits / results.hybrid.total) * 100;
    const mediaAcc = (results.media.hits / results.media.total) * 100;
    const vortexAcc = (results.vortex.hits / results.vortex.total) * 100;
    const antiVortexAcc = (results.antiVortex.hits / results.antiVortex.total) * 100;

    console.log('═'.repeat(80));
    console.log('\n📊 RESULTADOS\n');

    console.log('┌─────────────────────────────┬──────────┬──────────┬──────────┐');
    console.log('│ Sistema                     │ Acertos  │ Total    │ Precisão │');
    console.log('├─────────────────────────────┼──────────┼──────────┼──────────┤');

    const systems = [
        { name: 'Média Camadas', acc: mediaAcc, hits: results.media.hits },
        { name: 'Anti-Vortex Pyramid', acc: antiVortexAcc, hits: results.antiVortex.hits },
        { name: 'Vortex Pyramid', acc: vortexAcc, hits: results.vortex.hits },
        { name: 'HÍBRIDO Média+AntiVortex', acc: hybridAcc, hits: results.hybrid.hits }
    ];

    systems.sort((a, b) => b.acc - a.acc);

    systems.forEach(sys => {
        const name = sys.name.padEnd(27, ' ');
        const hits = sys.hits.toString().padStart(8, ' ');
        const total = '500'.padStart(8, ' ');
        const acc = `${sys.acc.toFixed(1)}%`.padStart(8, ' ');

        console.log(`│ ${name} │ ${hits} │ ${total} │ ${acc} │`);
    });

    console.log('└─────────────────────────────┴──────────┴──────────┴──────────┘');

    // Analysis
    console.log('\n' + '═'.repeat(80));
    console.log('\n💡 ANÁLISE\n');

    const best = systems[0];
    console.log(`🥇 Melhor sistema: ${best.name} (${best.acc.toFixed(1)}%)`);

    if (best.name.includes('HÍBRIDO')) {
        const improvement = hybridAcc - Math.max(mediaAcc, antiVortexAcc);
        if (improvement > 0.5) {
            console.log(`\n✅ O híbrido MELHOROU em ${improvement.toFixed(1)}%!`);
        } else if (improvement > -0.5) {
            console.log(`\n⚠️  O híbrido ficou SIMILAR aos sistemas individuais.`);
        } else {
            console.log(`\n❌ O híbrido ficou PIOR que os sistemas individuais.`);
        }
    } else {
        console.log(`\n❌ O híbrido NÃO superou os sistemas individuais.`);
        console.log(`   Melhor continuar com: ${best.name}`);
    }

    // Compare with 60% target
    console.log(`\n🎯 Meta: 60%`);
    console.log(`   Melhor resultado: ${best.acc.toFixed(1)}%`);
    console.log(`   Gap: ${(60 - best.acc).toFixed(1)}%`);

    if (best.acc >= 60) {
        console.log(`   ✅ META ATINGIDA!`);
    } else if (best.acc >= 57) {
        console.log(`   ⚠️  Muito perto!`);
    } else {
        console.log(`   ❌ Ainda longe da meta.`);
    }

    console.log('\n' + '═'.repeat(80));
}

// Run test
testHybridSystem()
    .then(() => {
        console.log('\n✅ Teste concluído!');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n❌ Erro:', error);
        process.exit(1);
    });
