import { prisma } from '../src/lib/prisma';
import { evaluateDraw } from '../src/services/evaluationService';
import { initializeSystems } from '../src/services/ranking';

async function backfillLotofacil() {
    console.log('🚀 INICIANDO RECÁLCULO COMPLETO DO HISTÓRICO DA LOTOFÁCIL (1º AO ÚLTIMO SORTEIO)');
    const startTime = Date.now();

    // 1. Garantir que todos os sistemas da Lotofácil estão registados na BD
    await initializeSystems();

    // 2. Obter todos os sorteios da Lotofácil por ordem cronológica (do 1º ao mais recente)
    const draws = await prisma.draw.findMany({
        where: { game: 'LOTOFACIL' },
        orderBy: { date: 'asc' },
        select: { id: true, date: true, sequenceNumber: true }
    });

    const total = draws.length;
    console.log(`📊 Encontrados ${total} sorteios da Lotofácil para recalcular.\n`);

    let processed = 0;
    let skipped = 0;
    let newlyEvaluated = 0;

    for (let i = 0; i < total; i++) {
        const draw = draws[i];
        
        // Verificar se já tem avaliações completas para este sorteio
        const existingCount = await prisma.systemPrediction.count({
            where: { drawId: draw.id, domain: 'NUMBERS' }
        });

        if (existingCount >= 14) {
            skipped++;
            processed++;
            if (processed % 100 === 0 || processed === total) {
                const pct = ((processed / total) * 100).toFixed(1);
                const elapsedMin = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
                console.log(`[LOTOFACIL] Progresso: ${processed}/${total} (${pct}%) - Ignorados (já calculados): ${skipped}, Novos: ${newlyEvaluated} | Tempo: ${elapsedMin} min`);
            }
            continue;
        }

        try {
            await evaluateDraw(draw.id);
            newlyEvaluated++;
            processed++;

            if (processed % 50 === 0 || processed === total) {
                const pct = ((processed / total) * 100).toFixed(1);
                const elapsedMin = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
                console.log(`[LOTOFACIL] Progresso: ${processed}/${total} (${pct}%) - Novos calculados: ${newlyEvaluated} | Tempo: ${elapsedMin} min`);
            }
        } catch (error) {
            console.error(`❌ Erro no sorteio ${draw.id} (#${draw.sequenceNumber || i + 1}):`, error);
        }
    }



    const totalMinutes = ((Date.now() - startTime) / 1000 / 60).toFixed(2);
    console.log(`\n=============================================================`);
    console.log(`✅ RECÁLCULO DA LOTOFÁCIL CONCLUÍDO COM SUCESSO!`);
    console.log(`Total de sorteios processados: ${processed}`);
    console.log(`Novos sorteios avaliados:      ${newlyEvaluated}`);
    console.log(`Sorteios previamente prontos:  ${skipped}`);
    console.log(`Tempo total despendido:        ${totalMinutes} minutos`);
    console.log(`=============================================================\n`);
}

backfillLotofacil()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
