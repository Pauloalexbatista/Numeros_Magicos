import { PrismaClient } from '@prisma/client';
import { BASE_NUMBER_SYSTEMS } from '../../services/system-registry';
import { Draw } from '../../services/statistics';

const prisma = new PrismaClient();

async function main() {
    const args = process.argv.slice(2);
    const game = args[0] || 'EUROMILLIONS';
    const systemFilter = args[1]; // Optional: name of a specific system
    
    console.log(`\n=== INICIANDO EXTRACAO DE FULL POOLS PARA ${game} ===`);
    if (systemFilter) console.log(`=> Filtrando para o sistema: ${systemFilter}`);

    // Get all systems
    const systemsInfo = await prisma.rankedSystem.findMany({
        where: {
            isActive: true,
            game: game,
            domain: 'NUMBERS'
        }
    });

    const systemsToRun = systemFilter 
        ? systemsInfo.filter(s => s.name.toLowerCase().includes(systemFilter.toLowerCase()))
        : systemsInfo;

    if (systemsToRun.length === 0) {
        console.log('Nenhum sistema encontrado para processar.');
        return;
    }

    // Load history (order by date asc for backfill)
    console.log(`=> Carregando historico de sorteios do ${game}...`);
    const history = await prisma.draw.findMany({
        where: { game },
        orderBy: { date: 'asc' }
    });
    
    if (history.length < 50) {
        console.log('Historico insuficiente.');
        return;
    }

    const draws: Draw[] = history.map(d => ({
        ...d,
        numbers: JSON.parse(d.numbers as string),
        stars: JSON.parse(d.stars as string),
        numbersDrawOrder: d.numbersDrawOrder ? JSON.parse(d.numbersDrawOrder as string) : undefined,
        starsDrawOrder: d.starsDrawOrder ? JSON.parse(d.starsDrawOrder as string) : undefined
    }));

    const registry = BASE_NUMBER_SYSTEMS;

    for (const sysInfo of systemsToRun) {
        console.log(`\n----------------------------------------`);
        console.log(`[${sysInfo.name}] Iniciando calculo de full pools...`);
        
        const system = registry.find(s => s.name === sysInfo.name);
        if (!system) {
            console.warn(`[${sysInfo.name}] Sistema nÃƒÂ£o encontrado no registry.`);
            continue;
        }

        let addedCount = 0;
        let skippedCount = 0;

        // Start evaluating from index 50 onwards to have enough history
        for (let i = 50; i < draws.length; i++) {
            const currentDraw = draws[i];
            const pastDraws = draws.slice(0, i).reverse(); // Order desc: most recent first

            // Check if we already have it
            const existing = await prisma.systemPerformanceFullPool.findFirst({
                where: {
                    drawId: currentDraw.id,
                    systemName: sysInfo.name,
                    game: game
                }
            });

            if (existing) {
                skippedCount++;
                continue;
            }

            // Calculate with returnFullPool = true
            try {
                // @ts-ignore
                const fullPool = await system.generateTop10(pastDraws, true);
                
                await prisma.systemPerformanceFullPool.create({
                    data: {
                        drawId: currentDraw.id,
                        game: game,
                        systemName: sysInfo.name,
                        predictedNumbers: JSON.stringify(fullPool),
                        actualNumbers: JSON.stringify(currentDraw.numbers)
                    }
                });
                addedCount++;
                
                if (addedCount % 100 === 0) {
                    process.stdout.write(`...${addedCount} `);
                }
            } catch (err) {
                console.error(`\nErro a processar draw ${currentDraw.id} no sistema ${sysInfo.name}:`, err);
            }
        }
        
        console.log(`\n[${sysInfo.name}] Concluido! Adicionados: ${addedCount} | Ignorados (ja existiam): ${skippedCount}`);
    }

    console.log(`\n=== EXTRACAO CONCLUIDA ===\n`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });