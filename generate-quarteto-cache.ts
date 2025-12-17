import { prisma } from '@/lib/prisma';
import QuartetoComplementar from '@/services/quarteto-complementar';

async function generateQuartetoCache() {
    console.log('\n🔮 Gerando Cache para Quarteto Complementar...\n');

    // 1. Buscar histórico
    const draws = await prisma.draw.findMany({
        orderBy: { date: 'desc' },
        take: 100 // Últimos 100 sorteios
    });

    console.log(`📦 Carregados ${draws.length} sorteios`);

    // 2. Gerar previsão
    const sistema = new QuartetoComplementar();
    console.log(`🎯 Sistema: ${sistema.name}`);

    const prediction = await sistema.generateTop25(draws);
    console.log(`✅ Previsão gerada: ${prediction.slice(0, 10).join(', ')}... (${prediction.length} números)`);

    // 3. Guardar na cache
    await prisma.cachedPrediction.upsert({
        where: { systemName: sistema.name },
        update: {
            numbers: JSON.stringify(prediction),
            updatedAt: new Date()
        },
        create: {
            systemName: sistema.name,
            numbers: JSON.stringify(prediction)
        }
    });

    console.log(`💾 Cache guardada com sucesso!`);

    // 4. Verificar
    const cache = await prisma.cachedPrediction.findFirst({
        where: { systemName: sistema.name }
    });

    console.log(`\n✅ Verificação:`);
    console.log(`   Sistema: ${cache?.systemName}`);
    console.log(`   Números: ${cache?.numbers.substring(0, 50)}...`);

    await prisma.$disconnect();
}

generateQuartetoCache()
    .then(() => {
        console.log('\n✅ Concluído!');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n❌ Erro:', error);
        process.exit(1);
    });
