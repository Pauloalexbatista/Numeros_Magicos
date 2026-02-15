/**
 * Register New Star Systems
 * 
 * Registers the 8 new star systems in the RankedSystem table
 * so they can have cached predictions
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const NEW_STAR_SYSTEMS = [
    { name: 'PyramidPascal Stars', description: 'Análise baseada no Triângulo de Pascal aplicado a estrelas' },
    { name: 'PyramidGaps Stars', description: 'Análise de gaps (intervalos) entre aparições de estrelas' },
    { name: 'Random Stars', description: 'Baseline aleatório para comparação' },
    { name: 'Sistema Combinado Media3 Stars', description: 'Combinação de médias dos últimos 3 sorteios' },
    { name: 'Sist Média sem as pontas Stars', description: 'Média excluindo extremos' },
    { name: 'Sist Média +3 Otimizado Stars', description: 'Média otimizada com peso +3' },
    { name: 'Sistema Camadas Stars', description: 'Análise por camadas de frequência' },
    { name: 'Universal Oscillation V2 Stars', description: 'Análise de oscilações universais' },
];

async function main() {
    console.log('📝 Registering new star systems...\n');

    for (const system of NEW_STAR_SYSTEMS) {
        try {
            await prisma.rankedSystem.upsert({
                where: { name: system.name },
                update: {
                    description: system.description,
                    isActive: true,
                    domain: 'STARS',
                    systemType: 'BASE'
                },
                create: {
                    name: system.name,
                    description: system.description,
                    isActive: true,
                    domain: 'STARS',
                    systemType: 'BASE',
                    game: 'EUROMILLIONS'
                }
            });
            console.log(`  ✅ ${system.name}`);
        } catch (error) {
            console.error(`  ❌ ${system.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    console.log('\n✅ All new star systems registered!\n');
}

main()
    .catch((e) => {
        console.error('❌ Fatal error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
