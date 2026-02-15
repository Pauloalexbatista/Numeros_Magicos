
import { prisma } from '../src/lib/prisma';
import { BASE_NUMBER_SYSTEMS } from '../src/services/system-registry';
import { EuroDreamsSystemWrapper } from '../src/services/eurodreams-systems';
import { TotolotoSystemWrapper } from '../src/services/totoloto-systems';
import { IPredictiveSystem } from '../src/services/ranked-systems';

async function main() {
    console.log('🔧 Fixing Missing Predictions (Schema Corrected)...');

    const GAMES = ['EUROMILLIONS', 'TOTOLOTO', 'EURODREAMS'] as const;

    for (const game of GAMES) {
        console.log(`\n👉 Processing ${game}...`);

        let gameSystems: IPredictiveSystem[] = [];
        if (game === 'EUROMILLIONS') {
            gameSystems = BASE_NUMBER_SYSTEMS;
        } else if (game === 'TOTOLOTO') {
            gameSystems = BASE_NUMBER_SYSTEMS.map(sys => new TotolotoSystemWrapper(sys));
        } else if (game === 'EURODREAMS') {
            gameSystems = BASE_NUMBER_SYSTEMS.map(sys => {
                const wrapper = new EuroDreamsSystemWrapper(sys);
                wrapper.name = `${sys.name} (EuroDreams)`;
                return wrapper;
            });
        }

        // 1. Get History
        const history = await prisma.draw.findMany({
            where: { game },
            orderBy: { date: 'desc' },
            take: 200
        });

        if (history.length === 0) continue;

        for (const system of gameSystems) {
            // Check if system exists in DB
            const dbSystem = await prisma.rankedSystem.findFirst({
                where: { name: system.name }
            });

            if (!dbSystem) {
                // console.log(`   ⚠️ System [${system.name}] not found in RankedSystem table.`);
                continue;
            }

            console.log(`   🔨 Processing [${system.name}]...`);

            try {
                // Generate
                const prediction = await system.generateTop10(history);
                const jsonPred = JSON.stringify(prediction);

                // Manual Check
                const existing = await prisma.cachedPrediction.findUnique({
                    where: { systemName: system.name }
                });

                if (existing) {
                    await prisma.cachedPrediction.update({
                        where: { id: existing.id },
                        data: {
                            numbers: jsonPred,
                            // generatedAt is NOT in schema based on previous error? 
                            // Wait, previous error showed 'generatedAt' in the 'data' object of the error message 
                            // BUT Schema view showed 'updatedAt'.
                            // Let's check schema again.
                            // Schema line 197: updatedAt DateTime @updatedAt
                            // There is NO generatedAt field in CachedPrediction model in schema I saw.
                            // I will remove generatedAt as well and rely on updatedAt.
                        }
                    });
                    console.log(`      ✅ Updated: [${prediction.join(', ')}]`);
                } else {
                    await prisma.cachedPrediction.create({
                        data: {
                            systemName: system.name,
                            numbers: jsonPred,
                            // worstNumbers is optional, omitting.
                        }
                    });
                    console.log(`      ✅ Created: [${prediction.join(', ')}]`);
                }

            } catch (e: any) {
                console.error(`      ❌ Failed (${system.name}):`, e.message || e);
            }
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
