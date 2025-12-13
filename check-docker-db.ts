import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: 'file:./prisma/dev-from-docker.db'
        }
    }
});

async function checkDockerDB() {
    console.log('🔍 VERIFICANDO BD DO DOCKER (dev-from-docker.db - 34.5MB)\n');

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

        console.log(`\n${drawCount > 0 ? '✅ BD DO DOCKER TEM DADOS!' : '❌ BD DO DOCKER ESTÁ VAZIA'}`);

    } catch (error: any) {
        console.error('❌ Erro:', error.message);
    }

    await prisma.$disconnect();
}

checkDockerDB();
