import { prisma } from '../../lib/prisma';
import { updateRanking, updateStarRankings, cachePredictions } from '../../services/ranking';

async function main() {
    console.log('🧹 Iniciando Limpeza de Sorteios Totoloto Corrompidos...');
    
    // Fetches all Totoloto draws
    const totolotoDraws = await prisma.draw.findMany({
        where: { game: 'TOTOLOTO' }
    });

    const invalidDrawIds: number[] = [];

    for (const draw of totolotoDraws) {
        const dateStr = draw.date.toISOString().split('T')[0];
        // Standardize to UTC noon to avoid timezone shift
        const normalized = new Date(dateStr + "T12:00:00Z");
        const day = normalized.getUTCDay();

        // Totoloto in the DB (since 2011) only occurs on Wednesday(3) and Saturday(6)
        if (day !== 3 && day !== 6) {
            invalidDrawIds.push(draw.id);
        }
    }

    if (invalidDrawIds.length === 0) {
        console.log('✨ Nenhum sorteio corrompido encontrado! A BD está limpa.');
        return;
    }

    console.log(`🚨 Encontrados ${invalidDrawIds.length} sorteios importados em dias errados (ex: Terças/Sextas do EuroMilhões).`);
    console.log('🗑️ A apagar referências com segurança...');

    try {
        await prisma.$transaction([
            prisma.systemPerformance.deleteMany({ where: { drawId: { in: invalidDrawIds } } }),
            prisma.starSystemPerformance.deleteMany({ where: { drawId: { in: invalidDrawIds } } }),
            prisma.systemPerformanceStaging.deleteMany({ where: { drawId: { in: invalidDrawIds } } }),
            prisma.systemPrediction.deleteMany({ where: { drawId: { in: invalidDrawIds } } }),
            prisma.draw.deleteMany({ where: { id: { in: invalidDrawIds } } })
        ]);

        console.log('✅ Remoção concluída com sucesso!');
        
        console.log('🔄 A atualizar Rankings e Estatísticas para refletir a limpeza...');
        await updateRanking();
        await updateStarRankings();
        await cachePredictions();

        console.log('🎉 Operação concluída!');

    } catch (error) {
        console.error('❌ Erro durante a limpeza:', error);
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
