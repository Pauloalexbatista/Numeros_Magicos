import { PrismaClient } from '@prisma/client';

async function verifyProductionSync() {
    console.log('🔍 ========================================');
    console.log('   VERIFICAÇÃO DA BASE DE DADOS PRODUÇÃO');
    console.log('========================================\n');

    const prodPrisma = new PrismaClient();

    try {
        // 1. Verificar contagem de draws
        console.log('📊 [1/5] Verificando Draws...');
        const drawCount = await prodPrisma.draw.count();
        const lastDraw = await prodPrisma.draw.findFirst({
            orderBy: { id: 'desc' },
            select: { id: true, date: true }
        });
        console.log(`   ✅ Total: ${drawCount} draws`);
        console.log(`   ✅ Último: Draw #${lastDraw?.id} (${new Date(lastDraw?.date || '').toLocaleDateString()})\n`);

        // 2. Verificar duplicados em SystemPerformance
        console.log('🔍 [2/5] Verificando duplicados em SystemPerformance...');
        const perfDuplicates = await prodPrisma.$queryRaw`
            SELECT drawId, systemName, COUNT(*) as count
            FROM SystemPerformance
            GROUP BY drawId, systemName
            HAVING COUNT(*) > 1
            LIMIT 10
        `;
        if (Array.isArray(perfDuplicates) && perfDuplicates.length > 0) {
            console.log(`   ❌ ENCONTRADOS ${perfDuplicates.length} DUPLICADOS!`);
            console.log(perfDuplicates);
        } else {
            console.log(`   ✅ Nenhum duplicado encontrado!\n`);
        }

        // 3. Verificar duplicados em StarSystemPerformance
        console.log('🔍 [3/5] Verificando duplicados em StarSystemPerformance...');
        const starPerfDuplicates = await prodPrisma.$queryRaw`
            SELECT drawId, systemName, COUNT(*) as count
            FROM StarSystemPerformance
            GROUP BY drawId, systemName
            HAVING COUNT(*) > 1
            LIMIT 10
        `;
        if (Array.isArray(starPerfDuplicates) && starPerfDuplicates.length > 0) {
            console.log(`   ❌ ENCONTRADOS ${starPerfDuplicates.length} DUPLICADOS!`);
            console.log(starPerfDuplicates);
        } else {
            console.log(`   ✅ Nenhum duplicado encontrado!\n`);
        }

        // 4. Verificar contagens gerais
        console.log('📊 [4/5] Verificando contagens gerais...');
        const systemPerfCount = await prodPrisma.systemPerformance.count();
        const starPerfCount = await prodPrisma.starSystemPerformance.count();
        const rankingCount = await prodPrisma.systemRanking.count();
        const cachedPredCount = await prodPrisma.cachedPrediction.count();

        console.log(`   ✅ SystemPerformance: ${systemPerfCount.toLocaleString()} registos`);
        console.log(`   ✅ StarSystemPerformance: ${starPerfCount.toLocaleString()} registos`);
        console.log(`   ✅ SystemRanking: ${rankingCount} sistemas`);
        console.log(`   ✅ CachedPrediction: ${cachedPredCount} previsões\n`);

        // 5. Verificar integridade referencial
        console.log('🔗 [5/5] Verificando integridade referencial...');
        const orphanPerfs = await prodPrisma.$queryRaw`
            SELECT COUNT(*) as count
            FROM SystemPerformance sp
            LEFT JOIN Draw d ON sp.drawId = d.id
            WHERE d.id IS NULL
        `;

        const orphanCount = Array.isArray(orphanPerfs) && orphanPerfs[0] ? (orphanPerfs[0] as any).count : 0;

        if (orphanCount > 0) {
            console.log(`   ⚠️  ATENÇÃO: ${orphanCount} performances órfãs (sem draw correspondente)!`);
        } else {
            console.log(`   ✅ Todas as performances têm draws correspondentes!\n`);
        }

        console.log('========================================');
        console.log('✅ VERIFICAÇÃO COMPLETA!');
        console.log('========================================\n');

    } catch (error) {
        console.error('❌ Erro durante verificação:', error);
        throw error;
    } finally {
        await prodPrisma.$disconnect();
    }
}

verifyProductionSync()
    .catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
