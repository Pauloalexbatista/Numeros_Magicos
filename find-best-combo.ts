import { prisma } from './src/lib/prisma';

/**
 * BUSCA AUTOMÁTICA: Melhor Combinação de 4 Sistemas
 * 
 * Encontra a combinação de 4 sistemas que maximiza a cobertura
 */

interface SystemHits {
    name: string;
    draws: Set<number>;
    totalHits: number;
    jackpots: number;
}

interface Combination {
    systems: string[];
    totalCoverage: number;
    overlap: number;
    complementarity: number;
    combinedJackpots: number;
    salvamentos: number;
    coveragePercentage: number;
}

// Generate combinations of 4 systems
function* generateCombinations<T>(array: T[], size: number): Generator<T[]> {
    if (size === 1) {
        for (const item of array) {
            yield [item];
        }
        return;
    }

    for (let i = 0; i <= array.length - size; i++) {
        for (const combo of generateCombinations(array.slice(i + 1), size - 1)) {
            yield [array[i], ...combo];
        }
    }
}

async function findBestCombination() {
    console.log('🔍 BUSCA AUTOMÁTICA: Melhor Combinação de 4 Sistemas\n');
    console.log('═'.repeat(80));

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

    const systems = Array.from(systemsMap.values())
        .sort((a, b) => b.totalHits - a.totalHits);

    console.log(`📊 Total de sistemas encontrados: ${systems.length}\n`);

    // Total de draws
    const totalDraws = await prisma.draw.count();
    console.log(`📋 Total de sorteios na BD: ${totalDraws}\n`);

    // Gerar todas as combinações de 4 sistemas
    console.log('🔄 Gerando combinações de 4 sistemas...');
    console.log('   ⚠️  Isto pode demorar alguns minutos...\n');

    const combinations: Combination[] = [];
    let count = 0;
    const startTime = Date.now();

    for (const systemCombo of generateCombinations(systems, 4)) {
        count++;

        // Progress indicator
        if (count % 10000 === 0) {
            const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
            console.log(`   Processadas ${count} combinações... (${elapsed}s)`);
        }

        // União de todos os draws
        const allDraws = new Set<number>();
        systemCombo.forEach(s => {
            s.draws.forEach(d => allDraws.add(d));
        });

        // Interseção
        const firstSystemDraws = Array.from(systemCombo[0].draws);
        const commonDraws = firstSystemDraws.filter(d =>
            systemCombo.every(s => s.draws.has(d))
        );

        const totalCoverage = allDraws.size;
        const overlap = commonDraws.length;
        const complementarity = totalCoverage > 0
            ? ((totalCoverage - overlap) / totalCoverage) * 100
            : 0;
        const coveragePercentage = (totalCoverage / totalDraws) * 100;
        const combinedJackpots = systemCombo.reduce((sum, s) => sum + s.jackpots, 0);
        const salvamentos = totalCoverage - combinedJackpots;

        combinations.push({
            systems: systemCombo.map(s => s.name),
            totalCoverage,
            overlap,
            complementarity,
            combinedJackpots,
            salvamentos,
            coveragePercentage
        });
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\n   ✅ Total de combinações geradas: ${combinations.length} (${elapsed}s)\n`);

    // Ordenar por cobertura percentual
    combinations.sort((a, b) => b.coveragePercentage - a.coveragePercentage);

    // Top 10
    console.log('═'.repeat(80));
    console.log('\n🏆 TOP 10 COMBINAÇÕES (Máxima Cobertura):\n');

    combinations.slice(0, 10).forEach((combo, idx) => {
        console.log(`${idx + 1}. COBERTURA: ${combo.coveragePercentage.toFixed(1)}% (${combo.totalCoverage}/${totalDraws} sorteios)`);
        console.log(`   Sistemas:`);
        combo.systems.forEach(s => console.log(`      - ${s}`));
        console.log(`   Jackpots: ${combo.combinedJackpots}`);
        console.log(`   Salvamentos: ${combo.salvamentos}`);
        console.log(`   Sobreposição: ${combo.overlap}`);
        console.log(`   Complementaridade: ${combo.complementarity.toFixed(1)}%`);
        console.log('');
    });

    // Procurar combinação com ~97%
    console.log('═'.repeat(80));
    console.log('\n🎯 PROCURANDO COMBINAÇÃO COM ~97% DE COBERTURA:\n');

    const target97 = combinations.filter(c =>
        c.coveragePercentage >= 96.5 && c.coveragePercentage <= 97.5
    );

    if (target97.length > 0) {
        console.log(`   ✅ Encontradas ${target97.length} combinações com ~97%!\n`);

        target97.slice(0, 5).forEach((combo, idx) => {
            console.log(`${idx + 1}. COBERTURA: ${combo.coveragePercentage.toFixed(1)}%`);
            console.log(`   Sistemas:`);
            combo.systems.forEach(s => console.log(`      - ${s}`));
            console.log(`   Jackpots: ${combo.combinedJackpots}`);
            console.log(`   Salvamentos: ${combo.salvamentos}`);
            console.log('');
        });
    } else {
        console.log(`   ⚠️  Nenhuma combinação encontrada com exatamente 97%`);
        console.log(`   Máxima cobertura encontrada: ${combinations[0].coveragePercentage.toFixed(1)}%`);
    }

    console.log('═'.repeat(80));
    console.log('\n✅ Busca concluída!\n');

    await prisma.$disconnect();
}

findBestCombination()
    .then(() => {
        console.log('✅ Script concluído!');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n❌ Erro:', error);
        process.exit(1);
    });
