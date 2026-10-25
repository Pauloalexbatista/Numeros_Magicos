import { prisma } from '../src/lib/prisma';
import { SistemaGeometriaCiclos } from '../src/services/custom/SistemaGeometriaCiclos';
import { updateRanking } from '../src/services/ranking';

async function main() {
    console.log('🚀 Iniciando registo e cálculo do sistema "Geometria & Ciclos"...');

    const system = new SistemaGeometriaCiclos();

    // 1. Registar em RankedSystem para todos os jogos principais
    const games = ['LOTOFACIL', 'EUROMILLIONS', 'TOTOLOTO', 'EURODREAMS', 'MEGASENA'];
    for (const game of games) {
        await prisma.rankedSystem.upsert({
            where: { name_game: { name: system.name, game } },
            update: { description: system.description, isActive: true },
            create: {
                name: system.name,
                game,
                description: system.description,
                systemType: 'base',
                domain: 'NUMBERS',
                isActive: true
            }
        });
    }
    console.log('✅ Sistema "Geometria & Ciclos" registado em RankedSystem!');

    // 2. Carregar sorteios da Lotofácil em ordem cronológica
    const draws = await prisma.draw.findMany({
        where: { game: 'LOTOFACIL' },
        orderBy: { date: 'asc' },
        select: { id: true, date: true, sequenceNumber: true, numbers: true, game: true }
    });

    console.log(`📊 Total de sorteios carregados: ${draws.length}`);

    // Avaliar para todos os sorteios (precisa de pelo menos 5 anteriores)
    let count = 0;
    const startTime = Date.now();

    for (let i = 5; i < draws.length; i++) {
        const currentDraw = draws[i];
        // Histórico estritamente anterior (do mais recente T-1 para trás)
        const history = [...draws.slice(0, i)].reverse() as any[];

        const fullPool = await system.generateTop10(history, true);
        const actual = typeof currentDraw.numbers === 'string' ? JSON.parse(currentDraw.numbers) : currentDraw.numbers;

        // Calcular acertos em cada corte
        const hits: Record<string, number> = {};
        for (const cut of [5, 10, 15, 20, 25]) {
            const top = fullPool.slice(0, cut);
            hits[`num_hits_${cut}`] = top.filter((n: number) => actual.includes(n)).length;
        }

        const data = {
            systemName: system.name,
            drawId: currentDraw.id,
            game: 'LOTOFACIL',
            domain: 'NUMBERS',
            cutoff: fullPool.length,
            prediction: JSON.stringify(fullPool),
            ...hits
        };

        const existing = await prisma.systemPrediction.findFirst({
            where: { systemName: system.name, drawId: currentDraw.id, domain: 'NUMBERS' }
        });

        if (existing) {
            await prisma.systemPrediction.update({
                where: { id: existing.id },
                data
            });
        } else {
            await prisma.systemPrediction.create({
                data
            });
        }

        count++;
        if (count % 500 === 0 || i === draws.length - 1) {
            console.log(`Progresso: ${count}/${draws.length - 5} (${((count / (draws.length - 5)) * 100).toFixed(1)}%)`);
        }
    }

    console.log(`⏱️ Previsões calculadas em ${((Date.now() - startTime) / 1000).toFixed(1)}s.`);

    // 3. Atualizar system_ranking
    console.log('🔄 A atualizar rankings...');
    await updateRanking();

    // 4. Gerar previsão para o próximo sorteio
    const allHistory = [...draws].reverse() as any[];
    const nextPrediction = await system.generateTop10(allHistory, true);
    console.log(`🎯 Próxima previsão (Top 20): [${nextPrediction.slice(0, 20).join(', ')}]`);

    // Guardar em cached_predictions
    const worst5 = nextPrediction.slice(20, 25);
    await prisma.cachedPrediction.upsert({
        where: {
            systemName_game: {
                systemName: system.name,
                game: 'LOTOFACIL'
            }
        },
        update: {
            numbers: JSON.stringify(nextPrediction),
            worstNumbers: JSON.stringify(worst5),
            updatedAt: new Date()
        },
        create: {
            systemName: system.name,
            game: 'LOTOFACIL',
            numbers: JSON.stringify(nextPrediction),
            worstNumbers: JSON.stringify(worst5)
        }
    });

    console.log('🎉 Concluído com sucesso! O sistema "Geometria & Ciclos" está 100% ativo e visível.');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
