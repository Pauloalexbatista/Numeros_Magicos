import { prisma } from './src/lib/prisma';

/**
 * VERIFICAÇÃO FINAL: 98% de Cobertura
 * 
 * Confirma o resultado com os sistemas EXATOS selecionados pelo utilizador
 */

async function verifyExactCombination() {
    console.log('🎯 VERIFICAÇÃO FINAL: Combinação de 98%\n');
    console.log('═'.repeat(80));

    // Sistemas EXATOS conforme selecionados na interface
    const targetSystems = [
        'Anti-Vortex Pyramid',
        'LSTM Neural Net',
        'Sist Combinado Medias-3',
        'Random Forest AI'
    ];

    console.log('\n📋 Sistemas Selecionados:');
    targetSystems.forEach((sys, idx) => {
        console.log(`   ${idx + 1}. ${sys}`);
    });

    // Buscar previsões com 3+ acertos
    console.log('\n🔎 Buscando previsões...');

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

    console.log(`   ✅ ${predictions.length} previsões encontradas\n`);

    // Mapear sistemas
    const systemDraws = new Map<string, Set<number>>();
    const systemJackpots = new Map<string, number>();

    predictions.forEach(pred => {
        // Normal
        if (pred.hits >= 3) {
            if (!systemDraws.has(pred.systemName)) {
                systemDraws.set(pred.systemName, new Set());
                systemJackpots.set(pred.systemName, 0);
            }
            systemDraws.get(pred.systemName)!.add(pred.drawId);
            if (pred.jackpot) {
                systemJackpots.set(pred.systemName, systemJackpots.get(pred.systemName)! + 1);
            }
        }

        // Anti
        if (pred.antiHits >= 3) {
            const antiName = `Anti-${pred.systemName}`;
            if (!systemDraws.has(antiName)) {
                systemDraws.set(antiName, new Set());
                systemJackpots.set(antiName, 0);
            }
            systemDraws.get(antiName)!.add(pred.drawId);
            if (pred.antiJackpot) {
                systemJackpots.set(antiName, systemJackpots.get(antiName)! + 1);
            }
        }
    });

    // Procurar sistemas com nomes similares
    console.log('🔍 Procurando sistemas...\n');

    const foundSystems: Array<{ name: string, draws: Set<number>, jackpots: number }> = [];

    for (const target of targetSystems) {
        let found = false;

        for (const [sysName, draws] of systemDraws.entries()) {
            // Procurar match exato ou parcial
            if (sysName === target ||
                sysName.includes(target) ||
                target.includes(sysName) ||
                sysName.replace(/Anti-Anti-/g, 'Anti-') === target ||
                sysName.replace(/Anti-/g, '') === target.replace(/Anti-/g, '')) {

                foundSystems.push({
                    name: sysName,
                    draws: draws,
                    jackpots: systemJackpots.get(sysName) || 0
                });

                console.log(`   ✅ ${target}`);
                console.log(`      → Encontrado: ${sysName}`);
                console.log(`      → ${draws.size} sorteios, ${systemJackpots.get(sysName)} jackpots`);
                found = true;
                break;
            }
        }

        if (!found) {
            console.log(`   ❌ ${target} - NÃO ENCONTRADO`);
        }
    }

    if (foundSystems.length !== 4) {
        console.log('\n⚠️  Não foram encontrados todos os 4 sistemas!');
        console.log('\nSistemas disponíveis que podem corresponder:');

        Array.from(systemDraws.keys())
            .filter(name =>
                name.includes('Vortex') ||
                name.includes('LSTM') ||
                name.includes('Combinado') ||
                name.includes('Random Forest')
            )
            .forEach(name => console.log(`   - ${name}`));

        await prisma.$disconnect();
        return;
    }

    // Calcular métricas
    console.log('\n' + '═'.repeat(80));
    console.log('\n📊 CÁLCULO DE COMPLEMENTARIDADE:\n');

    const allDraws = new Set<number>();
    foundSystems.forEach(s => s.draws.forEach(d => allDraws.add(d)));

    const firstDraws = Array.from(foundSystems[0].draws);
    const commonDraws = firstDraws.filter(d =>
        foundSystems.every(s => s.draws.has(d))
    );

    const totalDraws = await prisma.draw.count();
    const totalCoverage = allDraws.size;
    const overlap = commonDraws.length;
    const coveragePercentage = (totalCoverage / totalDraws) * 100;
    const combinedJackpots = foundSystems.reduce((sum, s) => sum + s.jackpots, 0);
    const salvamentos = totalCoverage - combinedJackpots;
    const complementarity = totalCoverage > 0
        ? ((totalCoverage - overlap) / totalCoverage) * 100
        : 0;

    console.log(`   Total de Sorteios na BD: ${totalDraws}`);
    console.log(`   Sorteios Cobertos: ${totalCoverage}`);
    console.log(`   Sobreposições: ${overlap}`);
    console.log(`   \n   ⭐ COBERTURA TOTAL (3+): ${coveragePercentage.toFixed(1)}%`);
    console.log(`   🎯 Jackpots Combinados: ${combinedJackpots}`);
    console.log(`   ⚠️  Salvamentos: ${salvamentos}`);
    console.log(`   🔄 Complementaridade: ${complementarity.toFixed(1)}%`);

    // Comparação
    console.log('\n' + '═'.repeat(80));
    console.log('\n✅ CONFIRMAÇÃO:\n');
    console.log(`   Interface mostra: 98.0%`);
    console.log(`   Script calculou: ${coveragePercentage.toFixed(1)}%`);
    console.log(`   Diferença: ${Math.abs(98.0 - coveragePercentage).toFixed(1)}%\n`);

    if (Math.abs(98.0 - coveragePercentage) < 0.5) {
        console.log('   🎉 CONFIRMADO! O resultado de 98% é VERDADEIRO!');
        console.log('\n   💡 SIGNIFICADO:');
        console.log(`      - ${totalCoverage} de ${totalDraws} sorteios (${coveragePercentage.toFixed(1)}%) foram cobertos`);
        console.log(`      - Pelo menos 1 dos 4 sistemas acertou 3+ números`);
        console.log(`      - ${combinedJackpots} jackpots (5 acertos) no total`);
        console.log(`      - ${salvamentos} salvamentos (3-4 acertos)`);
        console.log(`      - Apenas ${totalDraws - totalCoverage} sorteios não foram cobertos!`);
    } else {
        console.log('   ⚠️  Discrepância detectada - verificar dados');
    }

    // Detalhes por sistema
    console.log('\n' + '═'.repeat(80));
    console.log('\n📈 PERFORMANCE INDIVIDUAL:\n');

    foundSystems.forEach((sys, idx) => {
        const coverage = (sys.draws.size / totalDraws) * 100;
        console.log(`   ${idx + 1}. ${sys.name}`);
        console.log(`      Cobertura: ${sys.draws.size}/${totalDraws} (${coverage.toFixed(1)}%)`);
        console.log(`      Jackpots: ${sys.jackpots}`);
        console.log('');
    });

    console.log('═'.repeat(80));
    console.log('\n✅ Análise concluída!\n');

    await prisma.$disconnect();
}

verifyExactCombination()
    .then(() => {
        console.log('✅ Script concluído!');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n❌ Erro:', error);
        process.exit(1);
    });
