import { prisma } from '../lib/prisma';
import { rankedSystems } from '../services/ranked-systems';

async function main() {
    console.log('🏅 Forcing Medal Cache Update...');

    const history = await prisma.draw.findMany({
        orderBy: { date: 'desc' }
    });
    console.log(`Loaded ${history.length} draws.`);
    const allNumbers = Array.from({ length: 50 }, (_, i) => i + 1);

    // Filter Medal systems + Fixed System
    const targets = rankedSystems.filter(s =>
        s.name.includes('Sistema Ouro') ||
        s.name.includes('Sistema Prata') ||
        s.name.includes('Sistema Bronze') ||
        s.name.includes('Sistema Platina') ||
        s.name.includes('Média Vizinhos')
    );

    console.log(`Found ${targets.length} medal/fixed systems.`);

    for (const system of targets) {
        console.log(`Processing ${system.name}...`);
        try {
            const prediction = await system.generateTop10(history);

            const topNumbers = Array.from(new Set(prediction)).slice(0, 25);
            const worstNumbers = allNumbers.filter(n => !topNumbers.includes(n)).slice(0, 25);

            await prisma.cachedPrediction.upsert({
                where: { systemName: system.name },
                update: {
                    numbers: JSON.stringify(topNumbers),
                    worstNumbers: JSON.stringify(worstNumbers),
                    updatedAt: new Date()
                },
                create: {
                    systemName: system.name,
                    numbers: JSON.stringify(topNumbers),
                    worstNumbers: JSON.stringify(worstNumbers)
                }
            });
            console.log(`✅ Cached ${system.name}`);
        } catch (e) {
            console.error(`❌ Failed ${system.name}:`, e);
        }
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
