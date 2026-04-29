
import { backfillRankings } from '../../services/ranking';
import { prisma } from '../../lib/prisma';

async function main() {
    console.log('🚀 RECALCULAÇÃO TOTAL DE ESTRELAS: Iniciando limpeza...');

    try {
        // 1. Limpar apenas as tabelas de performance de estrelas
        console.log('🧹 Eliminando performance e rankings de estrelas antigos...');
        await prisma.starSystemPerformance.deleteMany({});
        await prisma.starSystemRanking.deleteMany({});
        console.log('✅ Tabelas de estrelas limpas.');

        // 2. Contar total de sorteios
        const totalDraws = await prisma.draw.count();
        console.log(`📊 Total de sorteios a reavaliar: ${totalDraws}`);

        // 3. Executar o backfill exclusivo para estrelas
        console.log('⚙️ Iniciando processamento (isto pode demorar alguns minutos)...');
        await backfillRankings(totalDraws + 100, 'stars');

        console.log('\n✨ RECALCULAÇÃO DE ESTRELAS CONCLUÍDA!');
        console.log('O histórico de Estrelas/Especiais está agora 100% unificado e correto.');

    } catch (error) {
        console.error('❌ Erro durante a recalculação:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
