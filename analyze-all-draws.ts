import { prisma } from './src/lib/prisma';

/**
 * ANÁLISE COMPLETA: Todos os Sorteios
 * 
 * Analisa a complementaridade dos 4 sistemas em TODO o histórico
 */

async function analyzeAllDraws() {
    console.log('🔬 ANÁLISE COMPLETA: Todos os Sorteios\n');
    console.log('═'.repeat(80));

    // Buscar TODOS os draws
    const allDraws = await prisma.draw.findMany({
        orderBy: { date: 'desc' },
        select: { id: true }
    });

    console.log(`\n📊 Total de sorteios: ${allDraws.length}\n`);

    // Buscar todas as previsões com 3+ acertos
    console.log('🔎 Carregando previsões...');
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
    console.log(`   ✅ ${predictions.length} previsões carregadas\n`);

    // Mapear sistemas
    const systemDraws = new Map<string, Set<number>>();
    const systemJackpots = new Map<string, Set<number>>();

    predictions.forEach(pred => {
        // Normal
        if (pred.hits >= 3) {
            if (!systemDraws.has(pred.systemName)) {
                systemDraws.set(pred.systemName, new Set());
                systemJackpots.set(pred.systemName, new Set());
            }
            systemDraws.get(pred.systemName)!.add(pred.drawId);
            if (pred.jackpot) {
                systemJackpots.get(pred.systemName)!.add(pred.drawId);
            }
        }

        // Anti
        if (pred.antiHits >= 3) {
            const antiName = `Anti-${pred.systemName}`;
            if (!systemDraws.has(antiName)) {
                systemDraws.set(antiName, new Set());
                systemJackpots.set(antiName, new Set());
            }
            systemDraws.get(antiName)!.add(pred.drawId);
            if (pred.antiJackpot) {
                systemJackpots.get(antiName)!.add(pred.drawId);
            }
        }
    });

    console.log(`📋 Total de sistemas encontrados: ${systemDraws.size}\n`);

    // Procurar os 4 sistemas com busca flexível
    console.log('🔍 Procurando os 4 sistemas...\n');

    const searchTerms = [
        ['Vortex Pyramid', 'Anti-Vortex'],
        ['LSTM', 'Neural Net'],
        ['Combinado', 'Media', 'Medias'],
        ['Random Forest', 'AI']
    ];

    const foundSystems: Array<{ name: string, draws: Set<number>, jackpots: Set<number> }> = [];

    for (const terms of searchTerms) {
        let found = false;

        for (const [sysName, draws] of systemDraws.entries()) {
            // Verificar se o nome contém TODOS os termos de busca
            const matchesAll = terms.every(term =>
                sysName.toLowerCase().includes(term.toLowerCase())
            );

            if (matchesAll) {
                foundSystems.push({
                    name: sysName,
                    draws: draws,
                    jackpots: systemJackpots.get(sysName) || new Set()
                });
                console.log(`   ✅ Encontrado: ${sysName}`);
                console.log(`      ${draws.size} sorteios, ${systemJackpots.get(sysName)?.size || 0} jackpots`);
                found = true;
                break;
            }
        }

        if (!found) {
            console.log(`   ⚠️  Não encontrado para: ${terms.join(', ')}`);
            console.log(`      Sistemas disponíveis com estes termos:`);

            for (const [sysName] of systemDraws.entries()) {
                if (terms.some(term => sysName.toLowerCase().includes(term.toLowerCase()))) {
                    console.log(`         - ${sysName}`);
                }
            }
        }
    }

    if (foundSystems.length !== 4) {
        console.log(`\n❌ Encontrados apenas ${foundSystems.length} de 4 sistemas!`);
        console.log('\n💡 Vou mostrar os sistemas mais relevantes:\n');

        // Mostrar top sistemas por cobertura
        const topSystems = Array.from(systemDraws.entries())
            .map(([name, draws]) => ({
                name,
                coverage: draws.size,
                jackpots: systemJackpots.get(name)?.size || 0
            }))
            .sort((a, b) => b.coverage - a.coverage)
            .slice(0, 20);

        topSystems.forEach((sys, idx) => {
            const pct = (sys.coverage / allDraws.length * 100).toFixed(1);
            console.log(`   ${idx + 1}. ${sys.name}`);
            console.log(`      Cobertura: ${sys.coverage}/${allDraws.length} (${pct}%)`);
            console.log(`      Jackpots: ${sys.jackpots}`);
            console.log('');
        });

        await prisma.$disconnect();
        return;
    }

    // Calcular complementaridade
    console.log('\n' + '═'.repeat(80));
    console.log('\n📊 ANÁLISE DE COMPLEMENTARIDADE (TODO O HISTÓRICO):\n');

    // União
    const allCovered = new Set<number>();
    foundSystems.forEach(s => s.draws.forEach(d => allCovered.add(d)));

    // Interseção
    const firstDraws = Array.from(foundSystems[0].draws);
    const commonDraws = firstDraws.filter(d =>
        foundSystems.every(s => s.draws.has(d))
    );

    // Jackpots únicos
    const allJackpots = new Set<number>();
    foundSystems.forEach(s => s.jackpots.forEach(d => allJackpots.add(d)));

    const totalDraws = allDraws.length;
    const coverage = allCovered.size;
    const coveragePercent = (coverage / totalDraws) * 100;
    const jackpots = allJackpots.size;
    const salvamentos = coverage - jackpots;
    const overlap = commonDraws.length;
    const complementarity = coverage > 0
        ? ((coverage - overlap) / coverage) * 100
        : 0;

    console.log(`   Total de Sorteios: ${totalDraws}`);
    console.log(`   Sorteios Cobertos: ${coverage}`);
    console.log(`   Sorteios NÃO Cobertos: ${totalDraws - coverage}`);
    console.log(`   \n   ⭐ COBERTURA TOTAL: ${coveragePercent.toFixed(1)}%`);
    console.log(`   🎯 Jackpots: ${jackpots}`);
    console.log(`   ⚠️  Salvamentos (3-4 acertos): ${salvamentos}`);
    console.log(`   🔄 Sobreposição: ${overlap}`);
    console.log(`   💎 Complementaridade: ${complementarity.toFixed(1)}%`);

    // Performance individual
    console.log('\n' + '═'.repeat(80));
    console.log('\n📈 PERFORMANCE INDIVIDUAL:\n');

    foundSystems.forEach((sys, idx) => {
        const coverage = (sys.draws.size / totalDraws) * 100;
        console.log(`   ${idx + 1}. ${sys.name}`);
        console.log(`      Cobertura: ${sys.draws.size}/${totalDraws} (${coverage.toFixed(1)}%)`);
        console.log(`      Jackpots: ${sys.jackpots.size}`);
        console.log('');
    });

    // Conclusão
    console.log('═'.repeat(80));
    console.log('\n💡 CONCLUSÃO:\n');

    if (coveragePercent >= 90) {
        console.log('   ✅ EXCELENTE! Cobertura >90% em TODO o histórico!');
        console.log('   🚀 RECOMENDAÇÃO FORTE: Implementar como sistema ensemble');
        console.log('   📊 Este é um resultado CONSISTENTE e REAL!');
        console.log(`   \n   🎉 De ${totalDraws} sorteios, apenas ${totalDraws - coverage} não foram cobertos!`);
    } else if (coveragePercent >= 80) {
        console.log('   ⚠️  BOM. Cobertura entre 80-90%');
        console.log('   🔍 RECOMENDAÇÃO: Analisar mais antes de implementar');
        console.log('   📊 Pode ser útil mas precisa de validação adicional');
    } else if (coveragePercent >= 70) {
        console.log('   ⚠️  MODERADO. Cobertura entre 70-80%');
        console.log('   📊 Resultado interessante mas não excepcional');
        console.log('   💡 Considerar como ferramenta auxiliar, não sistema principal');
    } else {
        console.log('   ❌ ATENÇÃO! Cobertura abaixo de 70%');
        console.log('   ⚠️  RECOMENDAÇÃO: NÃO implementar');
        console.log('   📊 Resultado dos últimos 50-100 foi anomalia estatística');
    }

    console.log('\n' + '═'.repeat(80));
    console.log('\n✅ Análise completa concluída!\n');

    await prisma.$disconnect();
}

analyzeAllDraws()
    .then(() => {
        console.log('✅ Script concluído!');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n❌ Erro:', error);
        process.exit(1);
    });
