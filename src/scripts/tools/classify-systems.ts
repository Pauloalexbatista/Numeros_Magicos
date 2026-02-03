import { prisma } from '@/lib/prisma';

/**
 * Automatically classify all systems based on their names and characteristics
 */

interface SystemClassification {
    systemType: 'BASE' | 'NEURAL' | 'ENSEMBLE';
    domain: 'NUMBERS' | 'STARS';
    complexity: 1 | 2 | 3;
    priority: number;
    dependencies: string[] | null;
}

function classifySystem(name: string, description: string): SystemClassification {
    let systemType: SystemClassification['systemType'] = 'BASE';
    let domain: SystemClassification['domain'] = 'NUMBERS';
    let complexity: SystemClassification['complexity'] = 1;
    let priority = 50;
    let dependencies: string[] | null = null;

    // Determine DOMAIN
    if (name.includes('Star') || name.includes('Estrela')) {
        domain = 'STARS';
    }

    // Determine SYSTEM TYPE
    if (name.includes('LSTM') || name.includes('Neural') || name.includes('Random Forest') ||
        name.includes('Gradient') || name.includes('Machine Learning')) {
        systemType = 'NEURAL';
        complexity = 3;
        priority = 40;
    } else if (
        name.includes('Ouro') || name.includes('Prata') || name.includes('Bronze') ||
        name.includes('Platina') || name.includes('Quarteto') || name.includes('Ensemble') ||
        name.includes('Consensus') || name.includes('Medal') || name.includes('Complementar')
    ) {
        systemType = 'ENSEMBLE';
        complexity = 2;
        priority = 70;

        // Extract dependencies from description
        dependencies = extractDependencies(name, description);
    } else {
        systemType = 'BASE';
        complexity = 1;
        priority = 10;
    }

    // Add some randomness to priority to avoid conflicts (within ±10)
    priority += Math.floor(Math.random() * 20) - 10;

    return { systemType, domain, complexity, priority, dependencies };
}

function extractDependencies(name: string, description: string): string[] | null {
    const deps: string[] = [];

    // Common ensemble patterns
    if (name.includes('Quarteto Elite')) {
        deps.push('LSTM', 'Media+3', 'Random Forest', 'média sem as pontas');
    } else if (name.includes('Quarteto Complementar')) {
        deps.push('LSTM', 'Media+3', 'Random Forest', 'média sem as pontas');
    } else if (name.includes('Quarteto de Impacto')) {
        deps.push('Hot Numbers', 'PyramidPascal', 'Sistema Elástico', 'Random Generator');
    } else if (name.includes('Sistema Ouro')) {
        deps.push('LSTM', 'Random Forest', 'Sistema Média Camadas');
    } else if (name.includes('Sistema Prata')) {
        deps.push('LSTM', 'Random Forest', 'Hot Numbers', 'Markov Chain', 'Monte Carlo', 'Sistema Média Camadas');
    } else if (name.includes('Sistema Bronze')) {
        deps.push('LSTM', 'Random Forest', 'Hot Numbers', 'Markov Chain', 'Monte Carlo', 'PyramidPascal', 'Sistema Média Camadas', 'Clustering', 'Vortex Multi-Canal');
    } else if (name.includes('Sistema Platina')) {
        deps.push('LSTM', 'Random Forest', 'Hot Numbers', 'Markov Chain', 'Monte Carlo', 'PyramidPascal', 'Sistema Média Camadas', 'Clustering', 'Vortex Multi-Canal', 'Sistema Elástico', 'PyramidGaps', 'média sem as pontas');
    } else if (name.includes('Consensus Auto')) {
        // Extract from description
        if (description.includes('Anti-Vortex') && description.includes('LSTM')) {
            deps.push('Anti-Vortex', 'LSTM', 'Média+3');
        } else if (description.includes('Anti-Vortex') && description.includes('Camadas')) {
            deps.push('Anti-Vortex', 'Sistema Média Camadas', 'Média+3');
        }
    } else if (name.includes('Consensus Stars')) {
        deps.push('Hot Stars', 'Markov Stars', 'Vortex Stars');
    } else if (name.includes('Star Platinum')) {
        deps.push('Hot Stars', 'Markov Stars', 'Vortex Stars', 'Late Stars');
    } else if (name.includes('Quarteto Stars')) {
        deps.push('Hot Stars', 'Markov Stars', 'Vortex Stars', 'Anti-Hot Stars');
    }

    return deps.length > 0 ? deps : null;
}

async function classifyAllSystems() {
    console.log('🔍 Starting System Classification...\n');

    const systems = await prisma.rankedSystem.findMany({
        orderBy: { name: 'asc' }
    });

    console.log(`Found ${systems.length} systems to classify\n`);

    let updated = 0;
    const stats = {
        BASE: { NUMBERS: 0, STARS: 0 },
        NEURAL: { NUMBERS: 0, STARS: 0 },
        ENSEMBLE: { NUMBERS: 0, STARS: 0 }
    };

    for (const system of systems) {
        const classification = classifySystem(system.name, system.description || '');

        await prisma.rankedSystem.update({
            where: { id: system.id },
            data: {
                systemType: classification.systemType,
                domain: classification.domain,
                complexity: classification.complexity,
                priority: classification.priority,
                dependencies: classification.dependencies ? JSON.stringify(classification.dependencies) : null
            }
        });

        stats[classification.systemType][classification.domain]++;
        updated++;

        if (updated % 20 === 0) {
            console.log(`✓ Classified ${updated}/${systems.length}`);
        }
    }

    console.log(`\n✅ Classification Complete!\n`);
    console.log('📊 Statistics:');
    console.log('\nBASE Systems:');
    console.log(`   Numbers: ${stats.BASE.NUMBERS}`);
    console.log(`   Stars: ${stats.BASE.STARS}`);
    console.log('\nNEURAL Systems:');
    console.log(`   Numbers: ${stats.NEURAL.NUMBERS}`);
    console.log(`   Stars: ${stats.NEURAL.STARS}`);
    console.log('\nENSEMBLE Systems:');
    console.log(`   Numbers: ${stats.ENSEMBLE.NUMBERS}`);
    console.log(`   Stars: ${stats.ENSEMBLE.STARS}`);
    console.log(`\nTotal: ${updated} systems updated`);
}

classifyAllSystems()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
