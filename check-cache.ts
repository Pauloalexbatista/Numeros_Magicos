import { prisma } from '@/lib/prisma';

async function checkCache() {
    const cache = await prisma.cachedPrediction.findFirst({
        where: { systemName: 'Quarteto Complementar' }
    });

    console.log('\n🔍 Quarteto Complementar - Cache Status:\n');

    if (cache) {
        console.log('✅ Cache EXISTS');
        console.log(`📋 Numbers: ${cache.numbers}`);
    } else {
        console.log('❌ Cache NOT FOUND');
        console.log('\n💡 Solução: O MASTER_UPDATE deve ter falhado ao gerar a cache.');
        console.log('   Execute novamente ou adicione manualmente.');
    }

    await prisma.$disconnect();
}

checkCache();
