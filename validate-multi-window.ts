import { prisma } from './src/lib/prisma';

/**
 * VALIDAÇÃO MULTI-JANELA: Teste de Complementaridade
 * 
 * Testa a combinação de 4 sistemas em diferentes janelas temporais:
 * - Últimos 50 sorteios (baseline)
 * - Últimos 100 sorteios
 * - Últimos 200 sorteios
 * - Últimos 500 sorteios
 * - Todo o histórico (1903 sorteios)
 */

interface WindowResult {
    window: string;
    totalDraws: number;
    coverage: number;
    coveragePercent: number;
    jackpots: number;
    salvamentos: number;
    overlap: number;
}

async function validateMultiWindow() {
    console.log('🔬 VALIDAÇÃO MULTI-JANELA: Complementaridade\n');
    console.log('═'.repeat(80));

    // Sistemas a testar
    const targetSystems = [
        'Anti-Vortex Pyramid',
        'LSTM Neural Net',
        'Sist Combinado Medias-3',
        'Random Forest AI'
    ];

    console.log('\n📋 Sistemas:');
    targetSystems.forEach((sys, idx) => console.log(`   ${idx + 1}. ${sys}`));

    // Buscar TODOS os draws ordenados por data
    const allDraws = await prisma.draw.findMany({
        orderBy: { date: 'desc' },
        select: { id: true }
    });

    console.log(`\n📊 Total de sorteios na BD: ${allDraws.length}\n`);

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

    // Encontrar sistemas
    console.log('🔍 Mapeando sistemas...\n');
    const foundSystems: Array<{ name: string, draws: Set<number>, jackpots: Set<number> }> = [];

    for (const target of targetSystems) {
        for (const [sysName, draws] of systemDraws.entries()) {
            if (sysName === target ||
                sysName.includes(target) ||
                target.includes(sysName) ||
                sysName.replace(/Anti-Anti-/g, 'Anti-') === target) {

                foundSystems.push({
                    name: sysName,
                    draws: draws,
                    jackpots: systemJackpots.get(sysName) || new Set()
                });
                console.log(`   ✅ ${target} → ${sysName}`);
                break;
            }
        }
    }

    if (foundSystems.length !== 4) {
        console.log('\n❌ Não foram encontrados todos os 4 sistemas!');
        await prisma.$disconnect();
        return;
    }

    // Testar em diferentes janelas
    const windows = [50, 100, 200, 500, allDraws.length];
    const results: WindowResult[] = [];

    console.log('\n' + '═'.repeat(80));
    console.log('\n🔬 TESTANDO EM DIFERENTES JANELAS:\n');

    for (const windowSize of windows) {
        const windowDrawIds = new Set(allDraws.slice(0, windowSize).map(d => d.id));

        // Filtrar draws dos sistemas para esta janela
        const windowSystemDraws = foundSystems.map(sys => ({
            ...sys,
            draws: new Set(Array.from(sys.draws).filter(d => windowDrawIds.has(d))),
            jackpots: new Set(Array.from(sys.jackpots).filter(d => windowDrawIds.has(d)))
        }));

        // União
        const allCovered = new Set<number>();
        windowSystemDraws.forEach(s => s.draws.forEach(d => allCovered.add(d)));

        // Interseção
        const firstDraws = Array.from(windowSystemDraws[0].draws);
        const commonDraws = firstDraws.filter(d =>
            windowSystemDraws.every(s => s.draws.has(d))
        );

        // Jackpots únicos
        const allJackpots = new Set<number>();
        windowSystemDraws.forEach(s => s.jackpots.forEach(d => allJackpots.add(d)));

        const coverage = allCovered.size;
        const coveragePercent = (coverage / windowSize) * 100;
        const jackpots = allJackpots.size;
        const salvamentos = coverage - jackpots;
        const overlap = commonDraws.length;

        results.push({
            window: windowSize === allDraws.length ? 'TOTAL' : `${windowSize}`,
            totalDraws: windowSize,
            coverage,
            coveragePercent,
            jackpots,
            salvamentos,
            overlap
        });

        console.log(`   ${windowSize === allDraws.length ? 'TOTAL' : `Últimos ${windowSize}`.padEnd(14)}: ${coveragePercent.toFixed(1)}% (${coverage}/${windowSize}) | Jackpots: ${jackpots} | Salvamentos: ${salvamentos}`);
    }

    // Tabela resumo
    console.log('\n' + '═'.repeat(80));
    console.log('\n📊 RESUMO COMPARATIVO:\n');
    console.log('┌─────────────┬──────────┬──────────┬──────────┬──────────┬──────────────┐');
    console.log('│   Janela    │ Sorteios │ Cobertura│ Jackpots │Salvamentos│ Sobreposição │');
    console.log('├─────────────┼──────────┼──────────┼──────────┼──────────┼──────────────┤');

    results.forEach(r => {
        const window = r.window.padEnd(11);
        const draws = r.totalDraws.toString().padStart(8);
        const cov = `${r.coveragePercent.toFixed(1)}%`.padStart(8);
        const jack = r.jackpots.toString().padStart(8);
        const salv = r.salvamentos.toString().padStart(10);
        const over = r.overlap.toString().padStart(12);
        console.log(`│ ${window} │ ${draws} │ ${cov} │ ${jack} │ ${salv} │ ${over} │`);
    });

    console.log('└─────────────┴──────────┴──────────┴──────────┴──────────┴──────────────┘');

    // Análise de tendência
    console.log('\n' + '═'.repeat(80));
    console.log('\n📈 ANÁLISE DE TENDÊNCIA:\n');

    const last50 = results[0].coveragePercent;
    const last100 = results[1].coveragePercent;
    const last200 = results[2].coveragePercent;
    const total = results[results.length - 1].coveragePercent;

    console.log(`   Últimos 50:  ${last50.toFixed(1)}%`);
    console.log(`   Últimos 100: ${last100.toFixed(1)}% (${(last100 - last50).toFixed(1)}%)`);
    console.log(`   Últimos 200: ${last200.toFixed(1)}% (${(last200 - last100).toFixed(1)}%)`);
    console.log(`   Total:       ${total.toFixed(1)}% (${(total - last200).toFixed(1)}%)`);

    // Conclusão
    console.log('\n' + '═'.repeat(80));
    console.log('\n💡 CONCLUSÃO:\n');

    if (total >= 90) {
        console.log('   ✅ EXCELENTE! Cobertura mantém-se >90% no histórico completo!');
        console.log('   🚀 RECOMENDAÇÃO: Implementar como sistema ensemble');
        console.log('   📊 Este é um resultado REAL e consistente!');
    } else if (total >= 80) {
        console.log('   ⚠️  BOM. Cobertura >80% mas abaixo de 90%');
        console.log('   🔍 RECOMENDAÇÃO: Analisar mais antes de implementar');
        console.log('   📊 Pode ser útil mas precisa de validação adicional');
    } else {
        console.log('   ❌ ATENÇÃO! Cobertura cai significativamente no histórico');
        console.log('   ⚠️  RECOMENDAÇÃO: NÃO implementar como sistema único');
        console.log('   📊 Resultado dos últimos 50 pode ser anomalia estatística');
    }

    console.log('\n' + '═'.repeat(80));
    console.log('\n✅ Validação concluída!\n');

    await prisma.$disconnect();
}

validateMultiWindow()
    .then(() => {
        console.log('✅ Script concluído!');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n❌ Erro:', error);
        process.exit(1);
    });
