import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function diagnoseProdDB() {
    console.log('🔍 DIAGNÓSTICO DA BASE DE DADOS DE PRODUÇÃO\n');
    console.log('='.repeat(60));

    try {
        // 1. Verificar total de sorteios
        const totalDraws = await prisma.draw.count();
        console.log(`\n📊 SORTEIOS (Draw)`);
        console.log(`   Total de sorteios: ${totalDraws}`);

        const firstDraw = await prisma.draw.findFirst({ orderBy: { date: 'asc' } });
        const lastDraw = await prisma.draw.findFirst({ orderBy: { date: 'desc' } });

        if (firstDraw && lastDraw) {
            console.log(`   Primeiro: ${firstDraw.date.toISOString().split('T')[0]} (ID: ${firstDraw.id})`);
            console.log(`   Último: ${lastDraw.date.toISOString().split('T')[0]} (ID: ${lastDraw.id})`);
        }

        // 2. Verificar SystemPerformance para LSTM Neural Net
        console.log(`\n🧠 SYSTEM PERFORMANCE (LSTM Neural Net)`);

        const lstmPerf = await prisma.systemPerformance.findMany({
            where: { systemName: 'LSTM Neural Net' },
            orderBy: { draw: { date: 'desc' } },
            take: 5,
            include: { draw: { select: { date: true } } }
        });

        const totalLSTM = await prisma.systemPerformance.count({
            where: { systemName: 'LSTM Neural Net' }
        });

        console.log(`   Total de registos: ${totalLSTM}`);
        console.log(`   Últimos 5 registos:`);
        lstmPerf.forEach(p => {
            console.log(`     - ${p.draw.date.toISOString().split('T')[0]}: ${p.hits} acertos`);
        });

        // 3. Contar jackpots (5 acertos) para LSTM
        const jackpots = await prisma.systemPerformance.count({
            where: {
                systemName: 'LSTM Neural Net',
                hits: 5
            }
        });

        console.log(`   Jackpots (5 acertos): ${jackpots}`);

        // 4. Distribuição de acertos
        console.log(`\n📈 DISTRIBUIÇÃO DE ACERTOS (LSTM Neural Net)`);

        for (let hits = 0; hits <= 5; hits++) {
            const count = await prisma.systemPerformance.count({
                where: {
                    systemName: 'LSTM Neural Net',
                    hits: hits
                }
            });
            const percentage = totalLSTM > 0 ? ((count / totalLSTM) * 100).toFixed(2) : '0.00';
            console.log(`   ${hits} acertos: ${count} (${percentage}%)`);
        }

        // 5. Calcular precisão global
        const allHits = await prisma.systemPerformance.findMany({
            where: { systemName: 'LSTM Neural Net' },
            select: { hits: true }
        });

        const totalHits = allHits.reduce((sum, p) => sum + p.hits, 0);
        const accuracy = totalLSTM > 0 ? ((totalHits / totalLSTM) / 5) * 100 : 0;

        console.log(`\n🎯 PRECISÃO GLOBAL: ${accuracy.toFixed(2)}%`);

        // 6. Verificar outros sistemas (top 5)
        console.log(`\n📋 OUTROS SISTEMAS (Top 5 por número de registos)`);

        const systemCounts = await prisma.systemPerformance.groupBy({
            by: ['systemName'],
            _count: { systemName: true },
            orderBy: { _count: { systemName: 'desc' } },
            take: 5
        });

        for (const sys of systemCounts) {
            console.log(`   ${sys.systemName}: ${sys._count.systemName} registos`);
        }

        // 7. Verificar RankedSystem
        console.log(`\n🏆 SISTEMAS REGISTADOS (RankedSystem)`);
        const rankedSystems = await prisma.rankedSystem.count();
        console.log(`   Total de sistemas: ${rankedSystems}`);

        // 8. Verificar se há dados recentes
        const recentPerf = await prisma.systemPerformance.findFirst({
            orderBy: { draw: { date: 'desc' } },
            include: { draw: { select: { date: true } } }
        });

        if (recentPerf) {
            console.log(`\n⏰ ÚLTIMO UPDATE`);
            console.log(`   Data do último sorteio processado: ${recentPerf.draw.date.toISOString().split('T')[0]}`);
        }

        console.log('\n' + '='.repeat(60));
        console.log('✅ Diagnóstico completo!\n');

    } catch (error) {
        console.error('❌ Erro ao diagnosticar:', error);
    } finally {
        await prisma.$disconnect();
    }
}

diagnoseProdDB();
