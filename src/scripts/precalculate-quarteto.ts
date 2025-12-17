import { prisma } from '@/lib/prisma';
import QuartetoComplementar from '@/services/quarteto-complementar';

/**
 * PRÉ-CÁLCULO: Quarteto Complementar
 * 
 * Gera previsões para todos os sorteios históricos
 */

async function precalculateQuarteto() {
    console.log('🎯 PRÉ-CÁLCULO: Quarteto Complementar\n');
    console.log('═'.repeat(80));

    const sistema = new QuartetoComplementar();

    console.log(`\n📋 Sistema: ${sistema.name}`);
    console.log(`📝 Descrição: ${sistema.description}`);
    console.log(`\n🔬 Composição:`);
    sistema.componentSystems.forEach((sys, idx) => {
        console.log(`   ${idx + 1}. ${sys}`);
    });

    // Buscar todos os draws ordenados por data
    console.log('\n🔎 Carregando sorteios...');
    const allDraws = await prisma.draw.findMany({
        orderBy: { date: 'asc' }
    });

    console.log(`   ✅ ${allDraws.length} sorteios encontrados\n`);

    // Limpar previsões antigas
    console.log('🗑️  Limpando previsões antigas...');
    await prisma.systemPrediction.deleteMany({
        where: { systemName: sistema.name }
    });
    console.log('   ✅ Limpeza concluída\n');

    // Gerar previsões
    console.log('⚙️  Gerando previsões...\n');

    let totalHits = 0;
    let total3Hits = 0;
    let total4Hits = 0;
    let totalJackpots = 0;

    const predictions: any[] = [];

    for (let i = 0; i < allDraws.length; i++) {
        const currentDraw = allDraws[i];
        const history = allDraws.slice(0, i).reverse(); // Histórico até este draw

        if (history.length < 10) continue; // Precisa de histórico mínimo

        try {
            // Gerar previsão
            const predicted = await sistema.generateTop25(history);

            // Números sorteados
            const drawn = typeof currentDraw.numbers === 'string'
                ? JSON.parse(currentDraw.numbers)
                : currentDraw.numbers;

            // Calcular acertos
            const hits = predicted.filter((n: number) => drawn.includes(n)).length;
            const jackpot = hits === 5;

            if (hits >= 3) {
                totalHits++;
                if (hits === 3) total3Hits++;
                if (hits === 4) total4Hits++;
                if (jackpot) totalJackpots++;
            }

            // Guardar previsão
            predictions.push({
                drawId: currentDraw.id,
                systemName: sistema.name,
                prediction: JSON.stringify(predicted),
                hits,
                jackpot,
                antiHits: 0,
                antiJackpot: false
            });

            // Progress
            if ((i + 1) % 100 === 0) {
                const pct = ((i + 1) / allDraws.length * 100).toFixed(1);
                console.log(`   Processados ${i + 1}/${allDraws.length} (${pct}%)`);
            }

        } catch (error) {
            console.error(`   ❌ Erro no draw ${currentDraw.id}:`, error);
        }
    }

    // Guardar em batch
    console.log('\n💾 Guardando previsões na base de dados...');

    const batchSize = 100;
    for (let i = 0; i < predictions.length; i += batchSize) {
        const batch = predictions.slice(i, i + batchSize);
        await prisma.systemPrediction.createMany({
            data: batch
        });
    }

    console.log('   ✅ Previsões guardadas\n');

    // Estatísticas
    console.log('═'.repeat(80));
    console.log('\n📊 ESTATÍSTICAS FINAIS:\n');

    const totalProcessed = predictions.length;
    const coverage = (totalHits / totalProcessed * 100).toFixed(1);

    console.log(`   Total de Sorteios: ${totalProcessed}`);
    console.log(`   Sorteios com 3+ acertos: ${totalHits} (${coverage}%)`);
    console.log(`   3 acertos: ${total3Hits}`);
    console.log(`   4 acertos: ${total4Hits}`);
    console.log(`   Jackpots (5 acertos): ${totalJackpots}`);

    // Calcular score
    const score = (total3Hits * 1) + (total4Hits * 10) + (totalJackpots * 100);
    console.log(`   \n   ⭐ SCORE: ${score}`);

    // Comparação com validação
    console.log('\n' + '═'.repeat(80));
    console.log('\n💡 COMPARAÇÃO COM VALIDAÇÃO:\n');
    console.log(`   Validação (união de 4 sistemas): 93.5%`);
    console.log(`   Ensemble (votação ponderada): ${coverage}%`);

    if (parseFloat(coverage) >= 50) {
        console.log(`   \n   ✅ EXCELENTE! Performance acima de 50%!`);
    } else {
        console.log(`   \n   ⚠️  Performance abaixo do esperado`);
        console.log(`   💡 Nota: Ensemble pode ter performance diferente da união`);
    }

    console.log('\n' + '═'.repeat(80));
    console.log('\n✅ Pré-cálculo concluído!\n');

    await prisma.$disconnect();
}

precalculateQuarteto()
    .then(() => {
        console.log('✅ Script concluído!');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n❌ Erro:', error);
        process.exit(1);
    });
