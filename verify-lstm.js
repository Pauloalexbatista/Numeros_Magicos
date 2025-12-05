const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyLSTM() {
    console.log('🔍 VERIFICAÇÃO LSTM STATUS\n');
    console.log('='.repeat(50));

    try {
        // 1. Verificar EXCLUSION LSTM (Prisma Generate Fix)
        console.log('\n🚫 EXCLUSION LSTM (Numbers/Stars Exclusion)');
        console.log('-'.repeat(50));

        // Check if table exists/is accessible (would throw if prisma generate failed)
        const exclusionCount = await prisma.exclusionCache.count();
        console.log(`✅ Tabela 'ExclusionCache' acessível!`);
        console.log(`📊 Registos em cache: ${exclusionCount}`);

        const predictions = await prisma.exclusionCache.findMany();
        if (predictions.length > 0) {
            predictions.forEach(p => {
                console.log(`   ➡ Tipo: ${p.type} | Confiança: ${p.confidence}% | LastDraw: ${p.lastDrawId}`);
            });
        } else {
            console.log('   ⚠️ Nenhum registo ainda (Visite /analysis/numbers ou /analysis/stars para ativar)');
        }

        // 2. Verificar STAR LSTM (Fix enable/fallback)
        console.log('\n⭐ STAR LSTM NEURAL NET');
        console.log('-'.repeat(50));

        const starLSTM = await prisma.starSystemRanking.findFirst({
            where: { systemName: 'Star LSTM Neural Net' }
        });

        if (starLSTM) {
            console.log(`✅ Sistema encontrado na BD!`);
            console.log(`   📊 Previsões totais: ${starLSTM.totalPredictions}`);
            console.log(`   🎯 Accuracy médio: ${starLSTM.avgAccuracy.toFixed(2)}%`);

            if (starLSTM.totalPredictions > 0) {
                console.log('   ✨ STATUS: TREINANDO/EXECUTANDO ✅');
            } else {
                console.log('   ⚠️ STATUS: Sem previsões registadas ainda. (Precisa de novos sorteios ou teste manual)');
            }
        } else {
            console.log('⚠️ Sistema "Star LSTM Neural Net" não encontrado no no ranking de estrelas.');
            console.log('   (Isto é normal se ainda não correu nenhuma vez apos o fix)');
        }

    } catch (error) {
        console.error('❌ ERRO CRÍTICO:', error.message);
        if (error.message.includes('ExclusionCache')) {
            console.error('   👉 Prisma Client ainda não conhece a tabela ExclusionCache.');
            console.error('   👉 Execute "npx prisma generate" novamente!');
        }
    } finally {
        await prisma.$disconnect();
    }
}

verifyLSTM();
