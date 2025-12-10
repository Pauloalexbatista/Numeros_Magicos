import { prisma } from '@/lib/prisma';

async function checkVortexMultiChannel() {
    console.log('🔍 Verificando Vortex Multi-Canal...\n');

    // Check SystemPrediction
    const pred2 = await prisma.systemPrediction.count({
        where: { systemName: 'Vortex Multi-Canal (2 canais)' }
    });
    const pred3 = await prisma.systemPrediction.count({
        where: { systemName: 'Vortex Multi-Canal (3 canais)' }
    });

    console.log('📊 SystemPrediction:');
    console.log(`  Vortex Multi-Canal (2 canais): ${pred2} previsões`);
    console.log(`  Vortex Multi-Canal (3 canais): ${pred3} previsões`);

    // Check SystemRanking
    const rank2 = await prisma.systemRanking.findUnique({
        where: { systemName: 'Vortex Multi-Canal (2 canais)' }
    });
    const rank3 = await prisma.systemRanking.findUnique({
        where: { systemName: 'Vortex Multi-Canal (3 canais)' }
    });

    console.log('\n🏆 SystemRanking:');
    console.log(`  Vortex Multi-Canal (2 canais): ${rank2 ? `${rank2.avgAccuracy}%` : '❌ NÃO EXISTE'}`);
    console.log(`  Vortex Multi-Canal (3 canais): ${rank3 ? `${rank3.avgAccuracy}%` : '❌ NÃO EXISTE'}`);

    // Check RankedSystem (active status)
    const active2 = await prisma.rankedSystem.findUnique({
        where: { name: 'Vortex Multi-Canal (2 canais)' }
    });
    const active3 = await prisma.rankedSystem.findUnique({
        where: { name: 'Vortex Multi-Canal (3 canais)' }
    });

    console.log('\n✅ RankedSystem (Ativo):');
    console.log(`  Vortex Multi-Canal (2 canais): ${active2 ? (active2.isActive ? '✅ ATIVO' : '⚠️ INATIVO') : '❌ NÃO EXISTE'}`);
    console.log(`  Vortex Multi-Canal (3 canais): ${active3 ? (active3.isActive ? '✅ ATIVO' : '⚠️ INATIVO') : '❌ NÃO EXISTE'}`);

    await prisma.$disconnect();
}

checkVortexMultiChannel();
