import { prisma } from '@/lib/prisma';

/**
 * PRÉ-CÁLCULO OTIMIZADO: Quarteto Complementar
 * 
 * Usa previsões JÁ EXISTENTES na BD dos 4 sistemas componentes
 * e faz apenas a votação ponderada - MUITO MAIS RÁPIDO!
 */

async function precalculateQuartetoOptimized() {
    console.log('🎯 PRÉ-CÁLCULO OTIMIZADO: Quarteto Complementar\n');
    console.log('═'.repeat(80));

    const systemName = 'Quarteto Complementar';

    // Sistemas componentes (conforme análise)
    const componentSystems = [
        'Vortex Pyramid',
        'LSTM Neural Net',
        'Sist Combinado Media+3',
        'Random Forest AI'
    ];

    console.log(`\n📋 Sistema: ${systemName}`);
    console.log(`\n🔬 Componentes:`);
    componentSystems.forEach((sys, idx) => {
        console.log(`   ${idx + 1}. ${sys}`);
    });

    // Buscar todos os draws
    console.log('\n🔎 Carregando sorteios...');
    const allDraws = await prisma.draw.findMany({
        orderBy: { date: 'asc' }
    });
    console.log(`   ✅ ${allDraws.length} sorteios\n`);

    // Buscar previsões existentes dos 4 sistemas
    console.log('📊 Carregando previsões dos sistemas componentes...');
    const existingPredictions = await prisma.systemPrediction.findMany({
        where: {
            systemName: {
                in: componentSystems
            }
        },
        select: {
            drawId: true,
            systemName: true,
            prediction: true
        }
    });
    console.log(`   ✅ ${existingPredictions.length} previsões carregadas\n`);

    // Agrupar por drawId
    const predictionsByDraw = new Map<number, Map<string, number[]>>();

    existingPredictions.forEach(pred => {
        if (!predictionsByDraw.has(pred.drawId)) {
            predictionsByDraw.set(pred.drawId, new Map());
        }

        const prediction = typeof pred.prediction === 'string'
            ? JSON.parse(pred.prediction)
            : pred.prediction;

        predictionsByDraw.get(pred.drawId)!.set(pred.systemName, prediction);
    });

    console.log(`📈 Draws com previsões completas: ${predictionsByDraw.size}\n`);

    // Limpar previsões antigas do Quarteto
    console.log('🗑️  Limpando previsões antigas...');
    await prisma.systemPrediction.deleteMany({
        where: { systemName }
    });
    console.log('   ✅ Limpeza concluída\n');

    // Gerar previsões do Quarteto por votação
    console.log('⚙️  Gerando previsões por votação ponderada...\n');

    let totalHits = 0;
    let total3Hits = 0;
    let total4Hits = 0;
    let totalJackpots = 0;
    let processed = 0;

    const newPredictions: any[] = [];

    for (const draw of allDraws) {
        const systemPreds = predictionsByDraw.get(draw.id);

        // Precisa de previsões dos 4 sistemas
        if (!systemPreds || systemPreds.size < 4) continue;

        // Verificar se tem todos os 4 sistemas
        const hasAll = componentSystems.every(sys => systemPreds.has(sys));
        if (!hasAll) continue;

        // VOTAÇÃO PONDERADA
        const votes = new Map<number, number>();

        componentSystems.forEach(sysName => {
            const pred = systemPreds.get(sysName)!;
            pred.forEach((num: number) => {
                votes.set(num, (votes.get(num) || 0) + 1);
            });
        });

        // Ordenar por votos
        const sortedByVotes = Array.from(votes.entries())
            .sort(([, a], [, b]) => b - a);

        // Separar por prioridade
        const maxPriority = sortedByVotes.filter(([, v]) => v >= 3);
        const highPriority = sortedByVotes.filter(([, v]) => v === 2);
        const lowPriority = sortedByVotes.filter(([, v]) => v === 1);

        // Top 25
        const top25 = [
            ...maxPriority.map(([num]) => num),
            ...highPriority.map(([num]) => num),
            ...lowPriority.map(([num]) => num)
        ].slice(0, 25);

        // Garantir 25 números
        if (top25.length < 25) {
            for (let i = 1; i <= 50; i++) {
                if (top25.length >= 25) break;
                if (!top25.includes(i)) top25.push(i);
            }
        }

        // Calcular acertos
        const drawn = typeof draw.numbers === 'string'
            ? JSON.parse(draw.numbers)
            : draw.numbers;

        const hits = top25.filter(n => drawn.includes(n)).length;
        const jackpot = hits === 5;

        if (hits >= 3) {
            totalHits++;
            if (hits === 3) total3Hits++;
            if (hits === 4) total4Hits++;
            if (jackpot) totalJackpots++;
        }

        // Guardar
        newPredictions.push({
            drawId: draw.id,
            systemName,
            prediction: JSON.stringify(top25),
            hits,
            jackpot,
            antiHits: 0,
            antiJackpot: false
        });

        processed++;

        if (processed % 100 === 0) {
            console.log(`   Processados ${processed} sorteios...`);
        }
    }

    // Guardar em batch
    console.log('\n💾 Guardando previsões...');
    const batchSize = 100;
    for (let i = 0; i < newPredictions.length; i += batchSize) {
        const batch = newPredictions.slice(i, i + batchSize);
        await prisma.systemPrediction.createMany({ data: batch });
    }
    console.log('   ✅ Previsões guardadas\n');

    // Estatísticas
    console.log('═'.repeat(80));
    console.log('\n📊 RESULTADOS FINAIS:\n');

    const coverage = (totalHits / processed * 100).toFixed(1);
    const score = (total3Hits * 1) + (total4Hits * 10) + (totalJackpots * 100);

    console.log(`   Total Processado: ${processed} sorteios`);
    console.log(`   Cobertura (3+): ${totalHits} (${coverage}%)`);
    console.log(`   3 acertos: ${total3Hits}`);
    console.log(`   4 acertos: ${total4Hits}`);
    console.log(`   Jackpots: ${totalJackpots}`);
    console.log(`   \n   ⭐ SCORE: ${score}`);

    console.log('\n' + '═'.repeat(80));
    console.log('\n💡 COMPARAÇÃO:\n');
    console.log(`   Validação (união): 93.5%`);
    console.log(`   Ensemble (votação): ${coverage}%`);

    if (parseFloat(coverage) >= 50) {
        console.log(`   \n   ✅ EXCELENTE! Performance >50%!`);
    }

    console.log('\n' + '═'.repeat(80));
    console.log('\n✅ Pré-cálculo concluído!\n');

    await prisma.$disconnect();
}

precalculateQuartetoOptimized()
    .then(() => {
        console.log('✅ Script concluído!');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n❌ Erro:', error);
        process.exit(1);
    });
