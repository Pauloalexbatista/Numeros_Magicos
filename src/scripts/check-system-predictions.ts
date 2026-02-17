import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkSystemPredictions() {
    console.log('🔍 Verificando previsões por sistema...\n');

    // 1. Get Draw Counts per Game
    const drawCounts = await prisma.draw.groupBy({
        by: ['game'],
        _count: { id: true }
    });

    const gameDraws: Record<string, number> = {};
    drawCounts.forEach(d => {
        gameDraws[d.game] = d._count.id;
    });

    console.log('📊 Total de Sorteios na DB:', gameDraws);

    // 2. Get count of predictions per system
    const systems = await prisma.systemPrediction.groupBy({
        by: ['systemName'],
        _count: {
            id: true
        },
        orderBy: {
            _count: {
                id: 'desc'
            }
        }
    });

    console.log('\n📊 Total de previsões por sistema:\n');

    // We need to know which game each system belongs to. 
    // Since SystemPrediction doesn't have 'game', we might need to infer or fetch from RankedSystem.
    // For now, let's look at the counts. 
    // Most systems should match one of the draw counts.

    const validCounts = Object.values(gameDraws);

    // Check for mismatches
    let hasError = false;

    for (const sys of systems) {
        // Simple heuristic: Does it match ANY game count?
        const isExactMatch = validCounts.includes(sys._count.id);

        // Allow a small margin (e.g., pending update for 1 draw)
        const isCloseMatch = validCounts.some(c => Math.abs(c - sys._count.id) <= 1);

        if (!isCloseMatch) {
            console.log(`❌ ${sys.systemName}: ${sys._count.id} previsões (Não corresponde a nenhum jogo: ${validCounts.join(' ou ')})`);
            hasError = true;
        } else {
            // Optional: Print only if verbose or just summary
            // console.log(`✅ ${sys.systemName}: ${sys._count.id}`);
        }
    }

    if (!hasError) {
        console.log('✅ Todos os sistemas têm o número correto de previsões (compatível com Euromilhões, Totoloto ou EuroDreams)!');
    }

    // Check specific systems
    const targetSystems = [
        'Clustering',
        'Markov Chain',
        'Sistema Oscilação Universal V2 (EuroDreams)'
    ];

    console.log('\n🎯 Verificação de Sistemas Chave:\n');
    for (const sysName of targetSystems) {
        const count = await prisma.systemPrediction.count({
            where: { systemName: sysName }
        });

        // Find closest game count
        const closest = validCounts.reduce((prev, curr) => {
            return (Math.abs(curr - count) < Math.abs(prev - count) ? curr : prev);
        });

        const status = Math.abs(closest - count) <= 1 ? '✅' : '❌';
        console.log(`${status} ${sysName}: ${count} previsões (Esperado: ~${closest})`);
    }

    await prisma.$disconnect();
}

checkSystemPredictions().catch(console.error);
