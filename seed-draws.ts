import { EuroMillionsService } from './src/services/euroMillionsService';

async function seedDatabase() {
    console.log('🎲 INICIANDO SEED DA BASE DE DADOS');
    console.log('📥 Fazendo scraping de TODOS os sorteios desde 2004...\n');
    console.log('⏱️  Isto pode demorar 5-10 minutos.\n');

    const service = new EuroMillionsService();

    try {
        await service.seedFromArchive();
        console.log('\n✅ SEED COMPLETO!');

        // Verificar quantos foram importados
        const { prisma } = await import('./src/lib/prisma');
        const count = await prisma.draw.count();
        console.log(`📊 Total de sorteios na BD: ${count}`);

        await prisma.$disconnect();
    } catch (error) {
        console.error('❌ Erro durante seed:', error);
        process.exit(1);
    }
}

seedDatabase();
