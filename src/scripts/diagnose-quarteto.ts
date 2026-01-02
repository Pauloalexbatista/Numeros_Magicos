
import { prisma } from '../lib/prisma';

async function main() {
    // 1. Get the problematic draws
    const dates = ['2025-12-26', '2025-12-30'];
    const draws = await prisma.draw.findMany({
        where: {
            date: { in: dates.map(d => new Date(d)) }
        }
    });

    console.log("=== DIAGNOSING QUARTETO COMPONENTS ===");
    console.log("Target Draws:", draws.length);

    const components = [
        'LSTM Neural Net',
        'Sist Combinado Media+3',
        'Random Forest AI',
        'média sem as pontas' // Careful with casing from the file
    ];

    for (const d of draws) {
        console.log(`\nChecking Draw: ${d.date.toISOString().split('T')[0]} (ID: ${d.id})`);

        for (const sysName of components) {
            // Check SystemPerformance (where history lives)
            const perf = await prisma.systemPerformance.findFirst({
                where: {
                    drawId: d.id,
                    systemName: { equals: sysName } // Exact match check
                }
            });

            if (perf) {
                console.log(`  ✅ ${sysName}: Found!`);
            } else {
                console.error(`  ❌ ${sysName}: MISSING!`);
                // Check if maybe it exists with a slightly different name?
                const flexible = await prisma.systemPerformance.findFirst({
                    where: {
                        drawId: d.id,
                        systemName: { contains: sysName.split(' ')[0] }
                    }
                });
                if (flexible) console.log(`     (But found '${flexible.systemName}')`);
            }
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
