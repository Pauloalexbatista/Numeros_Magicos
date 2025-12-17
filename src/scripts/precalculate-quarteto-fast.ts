import { prisma } from '@/lib/prisma';

/**
 * PRÉ-CÁLCULO SUPER OTIMIZADO: Quarteto Complementar
 * 
 * SEM IMPORTS DE SISTEMAS - Apenas lê previsões da BD e faz votação
 */

async function precalculateQuartetoFast() {
    console.log('⚡ PRÉ-CÁLCULO RÁPIDO: Quarteto Complementar\n');
    console.log('═'.repeat(80));

    const systemName = 'Quarteto Complementar';

    // Nomes EXATOS dos sistemas na BD
    const componentSystems = [
        'Vortex Pyramid',
        'LSTM Neural Net',
        'Sist Combinado Media+3',
        'Random Forest AI'
    ];

    console.log(`\n📋 Sistema: ${systemName}`);
    console.log(`🔬 Componentes: ${componentSystems.join(', ')}\n`);

    // Buscar previsões dos 4 sistemas
    console.log('📊 Carregando previsões...');
    const predictions = await prisma.systemPrediction.findMany({
        where: {
            systemName: { in: componentSystems }
        },
        select: {
            drawId: true,
            systemName: true,
            prediction: true
        },
        orderBy: { drawId: 'asc' }
    });
    console.log(`   ✅ ${predictions.length} previsões\n`);

    // Agrupar por drawId
    const byDraw = new Map<number, Map<string, number[]>>();

    predictions.forEach(p => {
        if (!byDraw.has(p.drawId)) {
            byDraw.set(p.drawId, new Map());
        }
        const nums = typeof p.prediction === 'string' ? JSON.parse(p.prediction) : p.prediction;
        byDraw.get(p.drawId)!.set(p.systemName, nums);
    });

    // Filtrar apenas draws com os 4 sistemas
    const validDrawIds: number[] = [];
    for (const [drawId, systems] of byDraw.entries()) {
        if (systems.size === 4) validDrawIds.push(drawId);
    }

    console.log(`✅ ${validDrawIds.length} draws com 4 sistemas completos\n`);

    // Buscar draws para calcular acertos
    const draws = await prisma.draw.findMany({
        where: { id: { in: validDrawIds } },
        select: { id: true, numbers: true }
    });

    const drawsMap = new Map(draws.map(d => [d.id, d]));

    // Limpar antigas
    console.log('🗑️  Limpando antigas...');
    await prisma.systemPrediction.deleteMany({ where: { systemName } });
    console.log('   ✅ Limpeza OK\n');

    // Gerar novas
    console.log('⚙️  Gerando por votação...\n');

    const newPreds: any[] = [];
    let stats = { total: 0, hits3plus: 0, hits3: 0, hits4: 0, jackpots: 0 };

    for (const drawId of validDrawIds) {
        const systemPreds = byDraw.get(drawId)!;

        // Votação
        const votes = new Map<number, number>();
        for (const pred of systemPreds.values()) {
            pred.forEach((n: number) => votes.set(n, (votes.get(n) || 0) + 1));
        }

        // Ordenar por votos
        const sorted = Array.from(votes.entries()).sort(([, a], [, b]) => b - a);
        const top25 = sorted.slice(0, 25).map(([n]) => n);

        // Preencher se <25
        if (top25.length < 25) {
            for (let i = 1; i <= 50 && top25.length < 25; i++) {
                if (!top25.includes(i)) top25.push(i);
            }
        }

        // Acertos
        const draw = drawsMap.get(drawId)!;
        const drawn = typeof draw.numbers === 'string' ? JSON.parse(draw.numbers) : draw.numbers;
        const hits = top25.filter(n => drawn.includes(n)).length;
        const jackpot = hits === 5;

        if (hits >= 3) {
            stats.hits3plus++;
            if (hits === 3) stats.hits3++;
            if (hits === 4) stats.hits4++;
            if (jackpot) stats.jackpots++;
        }

        newPreds.push({
            drawId,
            systemName,
            prediction: JSON.stringify(top25),
            hits,
            jackpot,
            antiHits: 0,
            antiJackpot: false
        });

        stats.total++;
        if (stats.total % 200 === 0) {
            console.log(`   ${stats.total} processados...`);
        }
    }

    // Guardar
    console.log('\n💾 Guardando...');
    for (let i = 0; i < newPreds.length; i += 100) {
        await prisma.systemPrediction.createMany({
            data: newPreds.slice(i, i + 100)
        });
    }
    console.log('   ✅ Guardado\n');

    // Stats
    console.log('═'.repeat(80));
    console.log('\n📊 RESULTADOS:\n');

    const cov = (stats.hits3plus / stats.total * 100).toFixed(1);
    const score = stats.hits3 + (stats.hits4 * 10) + (stats.jackpots * 100);

    console.log(`   Total: ${stats.total}`);
    console.log(`   Cobertura (3+): ${stats.hits3plus} (${cov}%)`);
    console.log(`   3 acertos: ${stats.hits3}`);
    console.log(`   4 acertos: ${stats.hits4}`);
    console.log(`   Jackpots: ${stats.jackpots}`);
    console.log(`   ⭐ SCORE: ${score}\n`);

    console.log('═'.repeat(80));
    console.log('\n✅ Concluído!\n');

    await prisma.$disconnect();
}

precalculateQuartetoFast()
    .then(() => process.exit(0))
    .catch(error => {
        console.error('\n❌ Erro:', error);
        process.exit(1);
    });
