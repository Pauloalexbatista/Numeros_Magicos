import { prisma } from '../lib/prisma';

/**
 * Script para desativar sistemas ML problemáticos
 * 
 * Sistemas a desativar:
 * - LSTM Neural Net
 * - Random Forest AI
 * - Standard Deviation
 * - Sistema Elástico
 * 
 * Razão: Causam hangs, precisam ser refeitos do zero
 */

const mlSystemsToDeactivate = [
    'LSTM Neural Net',
    'Random Forest AI',
    'Standard Deviation',
    'Sistema Elástico'
];

async function deactivateMLSystems() {
    console.log('🧠 DESATIVAÇÃO DE SISTEMAS ML\n');
    console.log('='.repeat(60));

    try {
        // 1. Verificar quais sistemas existem
        console.log('\n📋 Verificando sistemas na base de dados...\n');

        const existingSystems = await prisma.rankedSystem.findMany({
            where: {
                name: { in: mlSystemsToDeactivate }
            },
            select: {
                id: true,
                name: true,
                isActive: true
            }
        });

        if (existingSystems.length === 0) {
            console.log('⚠️  Nenhum dos sistemas ML foi encontrado na base de dados.');
            console.log('   Possível razão: Sistemas já foram removidos ou nunca foram criados.\n');
            return;
        }

        console.log(`✅ Encontrados ${existingSystems.length} sistema(s):\n`);
        existingSystems.forEach(sys => {
            const status = sys.isActive ? '🟢 Ativo' : '🔴 Inativo';
            console.log(`  ${status} - ${sys.name}`);
        });

        // 2. Desativar sistemas
        console.log(`\n🔧 Desativando sistemas...\n`);

        const result = await prisma.rankedSystem.updateMany({
            where: {
                name: { in: mlSystemsToDeactivate }
            },
            data: {
                isActive: false
            }
        });

        console.log(`✅ ${result.count} sistema(s) desativado(s) com sucesso!\n`);

        // 3. Verificar resultado
        console.log('📊 Status final:\n');

        const updatedSystems = await prisma.rankedSystem.findMany({
            where: {
                name: { in: mlSystemsToDeactivate }
            },
            select: {
                name: true,
                isActive: true
            }
        });

        updatedSystems.forEach(sys => {
            const status = sys.isActive ? '🟢 Ativo' : '🔴 Inativo';
            console.log(`  ${status} - ${sys.name}`);
        });

        console.log('\n' + '='.repeat(60));
        console.log('\n💡 PRÓXIMOS PASSOS:');
        console.log('  1. Verificar que os sistemas não aparecem mais nos cálculos');
        console.log('  2. Comentar imports em ranked-systems.ts');
        console.log('  3. Adicionar nota no admin panel');
        console.log('  4. Refazer sistemas ML após multi-game estável\n');

    } catch (error) {
        console.error('❌ Erro ao desativar sistemas:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Executar
deactivateMLSystems()
    .then(() => {
        console.log('✅ Script concluído com sucesso!');
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Erro fatal:', err);
        process.exit(1);
    });
