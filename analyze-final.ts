import { prisma } from './src/lib/prisma';

/**
 * ANÁLISE FINAL: 4 Sistemas em TODO o Histórico
 */

async function analyzeFinal() {
    console.log('🎯 ANÁLISE FINAL: 4 Sistemas - TODO o Histórico\n');
    console.log('═'.repeat(80));

    // Sistemas EXATOS conforme base de dados
    const exactSystems = [
        'Anti-Anti-Vortex Pyramid',
        'LSTM Neural Net',
        'Sist Combinado Media+3',
        'Anti-Random Forest AI'
    ];

    console.log('\n📋 Sistemas:');
    exactSystems.forEach((sys, idx) => console.log(`   ${idx + 1}. ${sys}`));

    const allDraws = await prisma.draw.findMany({
        orderBy: { date: 'desc' },
        select: { id: true }
    });

    console.log(`\n📊 Total de sorteios: ${allDraws.length}\n`);

    const predictions = await prisma.systemPrediction.findMany({
        where: {
            OR: [
                { hits: { gte: 3 } },
                { antiHits: { gte: 3 } }
            ]
        },
        select: {
            systemName: true,
            drawId: true,
            hits: true,
            antiHits: true,
            jackpot: true,
            antiJackpot: true
        }
    });

    const systemDraws = new Map<string, Set<number>>();
    const systemJackpots = new Map<string, Set<number>>();

    predictions.forEach(pred => {
        if (pred.hits >= 3) {
            if (!systemDraws.has(pred.systemName)) {
                systemDraws.set(pred.systemName, new Set());
                systemJackpots.set(pred.systemName, new Set());
            }
            systemDraws.get(pred.systemName)!.add(pred.drawId);
            if (pred.jackpot) systemJackpots.get(pred.systemName)!.add(pred.drawId);
        }

        if (pred.antiHits >= 3) {
            const antiName = `Anti-${pred.systemName}`;
            if (!systemDraws.has(antiName)) {
                systemDraws.set(antiName, new Set());
                systemJackpots.set(antiName, new Set());
            }
            systemDraws.get(antiName)!.add(pred.drawId);
            if (pred.antiJackpot) systemJackpots.get(antiName)!.add(pred.drawId);
        }
    });

    const foundSystems: Array<{ name: string, draws: Set<number>, jackpots: Set<number> }> = [];

    console.log('🔍 Carregando sistemas...\n');
    for (const sysName of exactSystems) {
        if (systemDraws.has(sysName)) {
            foundSystems.push({
                name: sysName,
                draws: systemDraws.get(sysName)!,
                jackpots: systemJackpots.get(sysName)!
            });
            console.log(`   ✅ ${sysName}: ${systemDraws.get(sysName)!.size} sorteios, ${systemJackpots.get(sysName)!.size} jackpots`);
        } else {
            console.log(`   ❌ ${sysName}: NÃO ENCONTRADO`);
        }
    }

    if (foundSystems.length !== 4) {
        console.log(`\n❌ Apenas ${foundSystems.length} de 4 sistemas encontrados!`);
        await prisma.$disconnect();
        return;
    }

    console.log('\n' + '═'.repeat(80));
    console.log('\n📊 RESULTADO FINAL - TODO O HISTÓRICO:\n');

    const allCovered = new Set<number>();
    foundSystems.forEach(s => s.draws.forEach(d => allCovered.add(d)));

    const firstDraws = Array.from(foundSystems[0].draws);
    const commonDraws = firstDraws.filter(d => foundSystems.every(s => s.draws.has(d)));

    const allJackpots = new Set<number>();
    foundSystems.forEach(s => s.jackpots.forEach(d => allJackpots.add(d)));

    const totalDraws = allDraws.length;
    const coverage = allCovered.size;
    const coveragePercent = (coverage / totalDraws) * 100;
    const jackpots = allJackpots.size;
    const salvamentos = coverage - jackpots;
    const overlap = commonDraws.length;
    const complementarity = coverage > 0 ? ((coverage - overlap) / coverage) * 100 : 0;

    console.log(`   📈 COBERTURA TOTAL: ${coveragePercent.toFixed(1)}%`);
    console.log(`   📊 Sorteios Cobertos: ${coverage}/${totalDraws}`);
    console.log(`   ❌ Sorteios NÃO Cobertos: ${totalDraws - coverage}`);
    console.log(`   🎯 Jackpots: ${jackpots}`);
    console.log(`   ⚠️  Salvamentos (3-4 acertos): ${salvamentos}`);
    console.log(`   🔄 Sobreposição: ${overlap}`);
    console.log(`   💎 Complementaridade: ${complementarity.toFixed(1)}%`);

    console.log('\n' + '═'.repeat(80));
    console.log('\n📈 PERFORMANCE INDIVIDUAL:\n');

    foundSystems.forEach((sys, idx) => {
        const cov = (sys.draws.size / totalDraws * 100).toFixed(1);
        console.log(`   ${idx + 1}. ${sys.name}`);
        console.log(`      ${sys.draws.size}/${totalDraws} (${cov}%) | Jackpots: ${sys.jackpots.size}`);
    });

    console.log('\n' + '═'.repeat(80));
    console.log('\n💡 CONCLUSÃO:\n');

    if (coveragePercent >= 90) {
        console.log('   🎉 EXTRAORDINÁRIO! Cobertura ≥90%!');
        console.log('   ✅ IMPLEMENTAR como sistema ensemble');
    } else if (coveragePercent >= 80) {
        console.log('   👍 MUITO BOM! Cobertura 80-90%');
        console.log('   ✅ CONSIDERAR implementação');
    } else if (coveragePercent >= 70) {
        console.log('   ⚠️  BOM. Cobertura 70-80%');
        console.log('   🔍 Analisar custo-benefício');
    } else {
        console.log('   ❌ Cobertura <70%');
        console.log('   ⚠️  NÃO implementar');
    }

    console.log('\n' + '═'.repeat(80) + '\n');

    await prisma.$disconnect();
}

analyzeFinal()
    .then(() => process.exit(0))
    .catch(error => {
        console.error('\n❌ Erro:', error);
        process.exit(1);
    });
