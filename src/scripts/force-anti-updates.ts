
import { prisma } from '../lib/prisma';
import { Draw } from '@prisma/client';

// Helper to get inverse (Anti-Prediction)
function getInverse(numbers: number[]): number[] {
    const all = Array.from({ length: 50 }, (_, i) => i + 1);
    return all.filter(n => !numbers.includes(n)).slice(0, 25);
}

async function main() {
    console.log("🚀 FORCING ANTI-SYSTEM UPDATES...");

    // 1. Get recent draws (last 5)
    const draws = await prisma.draw.findMany({
        orderBy: { date: 'desc' },
        take: 5,
        include: { systemPerformances: true }
    });

    for (const draw of draws) {
        console.log(`\nProcessing Draw: ${draw.date.toISOString().split('T')[0]} (ID: ${draw.id})`);

        // Find existing Main Systems
        const performances = draw.systemPerformances;

        for (const perf of performances) {
            // Check if this is a "Main" system (not starting with Anti-)
            if (!perf.systemName.startsWith('Anti-')) {
                const antiName = `Anti-${perf.systemName}`;

                // Check if Anti-System exists for this draw
                const antiExists = performances.find(p => p.systemName === antiName);

                if (!antiExists) {
                    console.log(`  ➕ Generating missing: ${antiName}`);

                    const mainPred = JSON.parse(perf.predictedNumbers);
                    const antiPred = getInverse(mainPred);
                    const actual = JSON.parse(draw.numbers);
                    const hits = antiPred.filter(n => actual.includes(n)).length;

                    await prisma.systemPerformance.create({
                        data: {
                            drawId: draw.id,
                            systemName: antiName,
                            predictedNumbers: JSON.stringify(antiPred),
                            actualNumbers: draw.numbers,
                            hits: hits,
                            accuracy: (hits / 5) * 100
                        }
                    });
                }
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
