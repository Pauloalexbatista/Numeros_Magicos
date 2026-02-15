
import { prisma } from '../src/lib/prisma';

async function main() {
    console.log(' Diagnosing Missing Predictions...');

    // 1. Get all active ranked systems
    const systems = await prisma.rankedSystem.findMany({
        where: { isActive: true },
        select: { name: true, domain: true, game: true }
    });

    console.log(` Found ${systems.length} active systems.`);

    // 2. Check CachedPrediction for each
    const missing: { name: string, domain: string, game: string }[] = [];
    const present: { name: string, domain: string, game: string }[] = [];

    for (const sys of systems) {
        const pred = await prisma.cachedPrediction.findFirst({
            where: { systemName: sys.name }
        });

        if (!pred) {
            missing.push(sys as any);
        } else {
            present.push(sys as any);
        }
    }

    console.log(`\n✅ Systems with Predictions: ${present.length}`);
    console.log(`❌ Systems MISSING Predictions: ${missing.length}`);

    if (missing.length > 0) {
        console.log('\n--- Missing Systems List ---');
        const grouped = missing.reduce((acc, sys) => {
            const key = `${sys.game} - ${sys.domain}`;
            if (!acc[key]) acc[key] = [];
            acc[key].push(sys.name);
            return acc;
        }, {} as Record<string, string[]>);

        for (const [group, names] of Object.entries(grouped)) {
            console.log(`\n[${group}] (${names.length}):`);
            names.forEach(n => console.log(` - ${n}`));
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
