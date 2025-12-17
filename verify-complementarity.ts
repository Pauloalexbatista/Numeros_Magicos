import { prisma } from './src/lib/prisma';

/**
 * VERIFICAÇÃO: Resultado de Complementaridade de 97%
 * 
 * Este script verifica se a combinação de 4 sistemas realmente
 * cobre 97% dos sorteios com 3+ acertos
 */

interface SystemHits {
    name: string;
    draws: Set<number>;
    totalHits: number;
    jackpots: number;
}

async function verifyComplementarity() {
    console.log('🔍 VERIFICAÇÃO DE COMPLEMENTARIDADE\n');
    console.log('═'.repeat(80));

    // Sistemas a testar (conforme reportado)
    const targetSystems = [
        'Anti-Vortex Pyramid',
        'LSTM Neural Net',
        'Sist Combinado Medias-3',
        'Random Forest AI'
    ];

    console.log('\n📋 Sistemas a Analisar:');
    targetSystems.forEach((sys, idx) => {
        console.log(`   ${idx + 1}. ${sys}`);
    });

    // Buscar todas as previsões com 3+ acertos
    console.log('\n🔎 Buscando previsões com 3+ acertos...');

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
        },
        orderBy: {
            drawId: 'desc'
        }
    });

    console.log(`   ✅ Encontradas ${predictions.length} previsões\n`);

    // Agrupar por sistema
    const systemsMap = new Map<string, SystemHits>();

    predictions.forEach(pred => {
        // Processar previsões normais
        if (pred.hits >= 3) {
            const key = pred.systemName;
            if (!systemsMap.has(key)) {
                systemsMap.set(key, {
                    name: key,
                    draws: new Set<number>(),
                    totalHits: 0,
                    jackpots: 0
                });
            }
            const system = systemsMap.get(key)!;
            system.draws.add(pred.drawId);
            system.totalHits++;
            if (pred.jackpot) system.jackpots++;
        }

        // Processar anti-previsões
        if (pred.antiHits >= 3) {
            const key = `Anti-${pred.systemName}`;
            if (!systemsMap.has(key)) {
                systemsMap.set(key, {
                    name: key,
                    draws: new Set<number>(),
                    totalHits: 0,
                    jackpots: 0
                });
            }
            const system = systemsMap.get(key)!;
            system.draws.add(pred.drawId);
            system.totalHits++;
            if (pred.antiJackpot) system.jackpots++;
        }
    });

    // Encontrar os sistemas target
    console.log('🎯 Procurando sistemas específicos...\n');

    const selectedSystems: SystemHits[] = [];
    const notFound: string[] = [];

    targetSystems.forEach(targetName => {
        let found = false;

        // Procurar correspondência exata ou parcial
        for (const [key, system] of systemsMap.entries()) {
            if (key.includes(targetName) || targetName.includes(key)) {
                selectedSystems.push(system);
                console.log(`   ✅ ${system.name}: ${system.totalHits} acertos, ${system.jackpots} jackpots`);
                found = true;
                break;
            }
        }

        if (!found) {
            notFound.push(targetName);
        }
    });

    if (notFound.length > 0) {
        console.log('\n   ⚠️  Sistemas não encontrados:');
        notFound.forEach(name => console.log(`      - ${name}`));
        console.log('\n   💡 Sistemas disponíveis:');
        Array.from(systemsMap.keys())
            .sort()
            .slice(0, 20)
            .forEach(name => console.log(`      - ${name}`));
    }

    if (selectedSystems.length < 4) {
        console.log('\n❌ Não foi possível encontrar todos os 4 sistemas!');
        await prisma.$disconnect();
        return;
    }

    // Calcular complementaridade
    console.log('\n' + '═'.repeat(80));
    console.log('\n📊 ANÁLISE DE COMPLEMENTARIDADE\n');

    // União de todos os draws
    const allDraws = new Set<number>();
    selectedSystems.forEach(s => {
        s.draws.forEach(d => allDraws.add(d));
    });

    // Interseção (draws onde TODOS acertaram)
    const firstSystemDraws = Array.from(selectedSystems[0].draws);
    const commonDraws = firstSystemDraws.filter(d =>
        selectedSystems.every(s => s.draws.has(d))
    );

    // Total de sorteios na BD
    const totalDraws = await prisma.draw.count();

    // Métricas
    const totalCoverage = allDraws.size;
    const overlap = commonDraws.length;
    const complementarity = totalCoverage > 0
        ? ((totalCoverage - overlap) / totalCoverage) * 100
        : 0;
    const coveragePercentage = (totalCoverage / totalDraws) * 100;
    const combinedJackpots = selectedSystems.reduce((sum, s) => sum + s.jackpots, 0);
    const salvamentos = totalCoverage - combinedJackpots;

    // Resultados
    console.log('🎯 RESULTADOS:\n');
    console.log(`   Total de Sorteios na BD: ${totalDraws}`);
    console.log(`   Sorteios Cobertos: ${totalCoverage}`);
    console.log(`   Sobreposições: ${overlap}`);
    console.log(`   Complementaridade: ${complementarity.toFixed(1)}%`);
    console.log(`   \n   ⭐ COBERTURA TOTAL: ${coveragePercentage.toFixed(1)}%`);
    console.log(`   \n   🎯 Jackpots Combinados: ${combinedJackpots}`);
    console.log(`   ⚠️  Salvamentos (3-4 acertos): ${salvamentos}`);

    // Comparação com resultado reportado
    console.log('\n' + '═'.repeat(80));
    console.log('\n📋 COMPARAÇÃO COM RESULTADO REPORTADO:\n');
    console.log(`   Reportado: 97.0%`);
    console.log(`   Calculado: ${coveragePercentage.toFixed(1)}%`);
    console.log(`   Diferença: ${Math.abs(97.0 - coveragePercentage).toFixed(1)}%\n`);

    if (Math.abs(97.0 - coveragePercentage) < 1.0) {
        console.log('   ✅ CONFIRMADO! O resultado de 97% é VERDADEIRO! 🎉');
    } else {
        console.log('   ⚠️  DISCREPÂNCIA detectada!');
        console.log('   Possíveis causas:');
        console.log('      - Base de dados diferente');
        console.log('      - Sistemas com nomes diferentes');
        console.log('      - Critério de filtragem diferente');
    }

    // Detalhes por sistema
    console.log('\n' + '═'.repeat(80));
    console.log('\n📈 DETALHES POR SISTEMA:\n');

    selectedSystems.forEach((sys, idx) => {
        const coverage = (sys.draws.size / totalDraws) * 100;
        console.log(`   ${idx + 1}. ${sys.name}`);
        console.log(`      Acertos: ${sys.totalHits}`);
        console.log(`      Jackpots: ${sys.jackpots}`);
        console.log(`      Sorteios Cobertos: ${sys.draws.size} (${coverage.toFixed(1)}%)`);
        console.log('');
    });

    // Análise de sobreposição
    if (overlap > 0) {
        console.log('═'.repeat(80));
        console.log('\n⚠️  SOBREPOSIÇÕES DETECTADAS:\n');
        console.log(`   ${overlap} sorteios onde TODOS os 4 sistemas acertaram`);
        console.log(`   Sorteios: ${commonDraws.slice(0, 10).join(', ')}${commonDraws.length > 10 ? '...' : ''}`);
    }

    console.log('\n' + '═'.repeat(80));
    console.log('\n✅ Verificação concluída!\n');

    await prisma.$disconnect();
}

verifyComplementarity()
    .then(() => {
        console.log('✅ Script concluído!');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n❌ Erro:', error);
        process.exit(1);
    });
