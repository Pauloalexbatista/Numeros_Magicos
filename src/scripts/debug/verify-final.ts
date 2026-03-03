
import { prisma } from '../../lib/prisma';

async function verify() {
    console.log('VERIFICATION START');

    const games = ['EUROMILLIONS', 'TOTOLOTO', 'EURODREAMS'];

    for (const game of games) {
        console.log(`\nChecking ${game}...`);

        const systems = await prisma.rankedSystem.findMany({
            where: { isActive: true, game }
        });

        const cached = await prisma.cachedPrediction.findMany({
            where: {
                systemName: { in: systems.map(s => s.name) }
            }
        });

        console.log(`Active Systems: ${systems.length}`);
        console.log(`Cached Predictions: ${cached.length}`);

        if (systems.length !== cached.length) {
            console.log('MISSING:');
            const cachedNames = cached.map(c => c.systemName);
            const missing = systems.filter(s => !cachedNames.includes(s.name));
            missing.forEach(m => console.log(` - ${m.name}`));
        } else {
            console.log('OK - ALL CACHED');
        }
    }
    console.log('\nVERIFICATION END');
}

verify()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
