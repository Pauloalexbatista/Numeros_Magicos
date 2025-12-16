import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyFix() {
    console.log('🔍 VERIFICAÇÃO FINAL DA CORREÇÃO\n');
    console.log('='.repeat(60));

    try {
        // Verificar dados na BD de Produção
        const lstmData = await prisma.systemPerformance.findMany({
            where: { systemName: 'LSTM Neural Net' },
            include: { draw: { select: { date: true } } },
            orderBy: { draw: { date: 'desc' } }
        });

        const totalRecords = lstmData.length;
        const jackpots = lstmData.filter(p => p.hits === 5).length;

        // Calcular precisão
        const totalHits = lstmData.reduce((sum, p) => sum + p.hits, 0);
        const accuracy = totalRecords > 0 ? ((totalHits / totalRecords) / 5) * 100 : 0;

        console.log('\n📊 DADOS NA BASE DE DADOS (Fonte de Verdade)');
        console.log(`   Total de registos: ${totalRecords}`);
        console.log(`   Jackpots (5 acertos): ${jackpots}`);
        console.log(`   Precisão: ${accuracy.toFixed(2)}%`);

        // Distribuição
        console.log('\n📈 DISTRIBUIÇÃO DE ACERTOS');
        for (let hits = 0; hits <= 5; hits++) {
            const count = lstmData.filter(p => p.hits === hits).length;
            const pct = totalRecords > 0 ? ((count / totalRecords) * 100).toFixed(2) : '0.00';
            console.log(`   ${hits} acertos: ${count} (${pct}%)`);
        }

        console.log('\n' + '='.repeat(60));
        console.log('✅ VERIFICAÇÃO COMPLETA!\n');
        console.log('🎯 O QUE O SITE DEVE MOSTRAR:');
        console.log(`   - Total Analisado: ${totalRecords}`);
        console.log(`   - Jackpots: ${jackpots}`);
        console.log(`   - Precisão: ${accuracy.toFixed(2)}%`);
        console.log('\n💡 Como os JSONs foram removidos, o site agora lê estes valores da BD.');
        console.log('   Abra https://numerosmagicos.com/analysis/ranking-lab para confirmar!\n');

    } catch (error) {
        console.error('❌ Erro:', error);
    } finally {
        await prisma.$disconnect();
    }
}

verifyFix();
