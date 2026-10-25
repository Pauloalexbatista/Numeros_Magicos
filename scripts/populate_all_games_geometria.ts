import { prisma } from '../src/lib/prisma';
import { SistemaGeometriaCiclos } from '../src/services/custom/SistemaGeometriaCiclos';
import { updateRanking } from '../src/services/ranking';

async function populateAllGames() {
    console.log('🚀 Iniciando cálculo do sistema "Geometria & Ciclos" para TODOS os jogos...');

    const system = new SistemaGeometriaCiclos();
    const games = ['EUROMILLIONS', 'TOTOLOTO', 'EURODREAMS', 'MEGASENA'];

    for (const game of games) {
        console.log(`\n======================================================`);
        console.log(`🎯 A processar ${game}...`);

        // 1. Garantir registo em RankedSystem
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

        // 2. Obter sorteios ordenados por data
        const draws = await prisma.draw.findMany({
            where: { game },
            orderBy: { date: 'asc' },
            select: { id: true, date: true, sequenceNumber: true, numbers: true, game: true }
        });

        console.log(`📊 Total de sorteios carregados para ${game}: ${draws.length}`);
        if (draws.length < 6) {
            console.log(`⚠️ Sorteios insuficientes para ${game}, a avançar...`);
            continue;
        }

        let count = 0;
        const startTime = Date.now();

        for (let i = 5; i < draws.length; i++) {
            const currentDraw = draws[i];
            const history = [...draws.slice(0, i)].reverse() as any[];

            const fullPool = await system.generateTop10(history, true);
            const actual = typeof currentDraw.numbers === 'string' ? JSON.parse(currentDraw.numbers) : currentDraw.numbers;

            const hits: Record<string, number> = {};
            for (const cut of [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60]) {
                const top = fullPool.slice(0, cut);
                hits[`num_hits_${cut}`] = top.filter((n: number) => actual.includes(n)).length;
            }

            const data = {
                systemName: system.name,
                drawId: currentDraw.id,
                game,
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
                console.log(`[${game}] Progresso: ${count}/${draws.length - 5} (${((count / (draws.length - 5)) * 100).toFixed(1)}%)`);
            }
        }

        console.log(`⏱️ ${game} concluído em ${((Date.now() - startTime) / 1000).toFixed(1)}s.`);

        // 3. Previsão para o próximo sorteio em cached_predictions
        const allHistory = [...draws].reverse() as any[];
        const nextPrediction = await system.generateTop10(allHistory, true);
        const predCount = game === 'EURODREAMS' ? 20 : game === 'MEGASENA' ? 30 : 25;
        const topSugestao = nextPrediction.slice(0, predCount);
        const worst = nextPrediction.slice(-5);

        await prisma.cachedPrediction.upsert({
            where: {
                systemName_game: {
                    systemName: system.name,
                    game
                }
            },
            update: {
                numbers: JSON.stringify(nextPrediction),
                worstNumbers: JSON.stringify(worst),
                updatedAt: new Date()
            },
            create: {
                systemName: system.name,
                game,
                numbers: JSON.stringify(nextPrediction),
                worstNumbers: JSON.stringify(worst)
            }
        });
        console.log(`🎯 [${game}] Próxima sugestão (Top ${predCount}): [${topSugestao.slice(0, 10).join(', ')}...]`);
    }

    console.log('\n🔄 A atualizar rankings globais...');
    await updateRanking();

    console.log('\n🎉 TODOS OS JOGOS CONCLUÍDOS! O sistema "Geometria & Ciclos" está 100% ativo em todas as modalidades.');
}

populateAllGames()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
