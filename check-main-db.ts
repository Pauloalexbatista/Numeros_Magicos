import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: 'file:./prisma/dev.db'
        }
    }
});

async function checkMainDB() {
    console.log('🔍 VERIFICANDO BD PRINCIPAL (prisma/dev.db - 32.88MB)\n');

    try {
        const drawCount = await prisma.draw.count();
        console.log(`✅ Sorteios (Draw): ${drawCount}`);

        if (drawCount > 0) {
            const latest = await prisma.draw.findFirst({
                orderBy: { date: 'desc' }
            });
            const oldest = await prisma.draw.findFirst({
                orderBy: { date: 'asc' }
            });
            console.log(`   Mais recente: ${latest?.date}`);
            console.log(`   Mais antigo: ${oldest?.date}`);
        }

        const mlPredictions = await prisma.systemPrediction.count({
            where: { systemName: 'Machine Learning (Regressão Logística)' }
        });
        console.log(`\n📊 Previsões ML: ${mlPredictions}`);

        const lstmPredictions = await prisma.systemPrediction.count({
            where: { systemName: 'LSTM Neural Net' }
        });
        console.log(`📊 Previsões LSTM: ${lstmPredictions}`);

    } catch (error: any) {
        console.error('❌ Erro:', error.message);
    }

    await prisma.$disconnect();
}

checkMainDB();
