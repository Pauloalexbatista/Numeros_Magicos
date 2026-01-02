
import { prisma } from '../lib/prisma';

async function main() {
    // 1. Get last 5 draws
    const lastDraws = await prisma.draw.findMany({
        orderBy: { date: 'desc' },
        take: 5
    });

    console.log("=== LAST 5 DRAWS ===");
    for (const d of lastDraws) {
        console.log(`Draw ID: ${d.id} | Date: ${d.date.toISOString().split('T')[0]}`);

        // Check for specific systems
        const perf = await prisma.systemPerformance.findMany({
            where: {
                drawId: d.id,
                systemName: { in: ['Anti-Root Sum (Raiz Digital)', 'Vortex Multi-Canal', 'Vortex V3 Multi-Channel'] } // Guessing names, will check all if empty
            },
            select: { systemName: true }
        });

        if (perf.length > 0) {
            console.log("  ✅ Found systems:", perf.map(p => p.systemName).join(', '));
        } else {
            console.log("  ❌ No performance records for target systems.");

            // Debug: List ANY system found for this draw
            const anyPerf = await prisma.systemPerformance.findFirst({ where: { drawId: d.id }, select: { systemName: true } });
            if (anyPerf) console.log(`     (But found '${anyPerf.systemName}' etc...)`);
            else console.log("     (NO PERFORMANCE RECORDS AT ALL)");
        }
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
