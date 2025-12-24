import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function analyzeVortexCalculation() {
    console.log('═'.repeat(150));
    console.log('📊 ANÁLISE DETALHADA: Como o Vortex Calcula os Últimos 10 Sorteios');
    console.log('═'.repeat(150));
    console.log();

    // Get draws 1896-1905
    const draws = await prisma.draw.findMany({
        where: { id: { gte: 1896, lte: 1905 } },
        orderBy: { id: 'asc' }
    });

    console.log('┌──────────┬──────────────┬─────────────────────────────────────────┬──────────────────────────────────────────┬────────────────┐');
    console.log('│ Sorteio  │     Data     │  Histórico Usado (com window=3000)      │  Histórico que DEVERIA usar (correto)   │   Diferença    │');
    console.log('│ a Prever │              │                                         │                                          │                │');
    console.log('├──────────┼──────────────┼─────────────────────────────────────────┼──────────────────────────────────────────┼────────────────┤');

    for (let i = 0; i < draws.length; i++) {
        const currentDraw = draws[i];
        const drawId = currentDraw.id.toString().padStart(4, ' ');
        const date = currentDraw.date.toLocaleDateString('pt-PT', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });

        // Com a lógica atual (predict-for-next)
        // Quando processamos draw i, usamos histórico até draw i (inclusive)
        // e prevemos para draw i+1

        const historyStart = Math.max(1, currentDraw.id - 3000 + 1);
        const historyEnd = currentDraw.id;
        const historySize = historyEnd - historyStart + 1;

        const actualHistorySize = Math.min(currentDraw.id, 3000);

        // O que DEVERIA ser (predict-for-next correto)
        const correctHistoryStart = Math.max(1, currentDraw.id - 100 + 1);
        const correctHistoryEnd = currentDraw.id;
        const correctHistorySize = correctHistoryEnd - correctHistoryStart + 1;

        const windowUsed = `Sorteios ${historyStart}-${historyEnd} (${actualHistorySize} sorteios)`;
        const correctWindow = `Sorteios ${correctHistoryStart}-${correctHistoryEnd} (${correctHistorySize} sorteios)`;

        // Calcular diferença entre sorteios consecutivos
        let difference = '';
        if (i > 0) {
            const prevDraw = draws[i - 1];
            const prevHistorySize = Math.min(prevDraw.id, 3000);
            const diff = actualHistorySize - prevHistorySize;
            const percentChange = ((diff / prevHistorySize) * 100).toFixed(3);
            difference = `+${diff} sorteio (${percentChange}%)`;
        } else {
            difference = 'N/A';
        }

        console.log(`│ ${drawId}     │ ${date} │ ${windowUsed.padEnd(39)} │ ${correctWindow.padEnd(40)} │ ${difference.padEnd(14)} │`);
    }

    console.log('└──────────┴──────────────┴─────────────────────────────────────────┴──────────────────────────────────────────┴────────────────┘');

    console.log();
    console.log('═'.repeat(150));
    console.log('💡 CONCLUSÕES:');
    console.log('═'.repeat(150));
    console.log();
    console.log('1. Com window=3000 (atual):');
    console.log('   - Cada sorteio adiciona apenas ~0.05% de novos dados');
    console.log('   - Por isso as predições são quase idênticas entre sorteios consecutivos');
    console.log('   - Exemplo: 1904→1905 adiciona 1 sorteio a 1904 existentes (0.05% de mudança)');
    console.log();
    console.log('2. Com window=100 (alternativa):');
    console.log('   - Cada sorteio adiciona 1% de novos dados (1 em 100)');
    console.log('   - Predições mudariam mais significativamente');
    console.log('   - Exemplo: 1904→1905 remove sorteio 1805 e adiciona 1905 (1% de mudança)');
    console.log();
    console.log('3. Isto está CORRETO?');
    console.log('   - ✅ SIM, se queremos padrões de longo prazo (estável)');
    console.log('   - ❌ NÃO, se queremos sistema responsivo a mudanças recentes (dinâmico)');
    console.log();
    console.log('═'.repeat(150));

    await prisma.$disconnect();
}

analyzeVortexCalculation().catch(console.error);
