
import { prisma } from './src/lib/prisma';

async function verifyJackpots() {
    console.log("Verifying Jackpots...");

    const suspiciousRecords = await prisma.systemPerformance.findMany({
        where: {
            systemName: 'Vortex Multi-Canal (2 canais)',
            hits: 5
        },
        take: 5,
        include: { draw: true }
    });

    console.log(`Found ${suspiciousRecords.length} samples.`);

    for (const record of suspiciousRecords) {
        console.log(`\nDraw #${record.drawId} (${record.draw.date.toISOString().split('T')[0]})`);

        let predicted: number[] = [];
        try {
            predicted = JSON.parse(record.predictedNumbers);
        } catch { console.log('Error parsing prediction'); }

        let actual: number[] = [];
        try {
            actual = typeof record.actualNumbers === 'string' ? JSON.parse(record.actualNumbers) : record.actualNumbers;
        } catch { console.log('Error parsing actual'); }

        console.log(`Predicted: ${predicted.join(', ')}`);
        console.log(`Actual:    ${actual.join(', ')}`);

        const realHits = actual.filter(n => predicted.includes(n)).length;
        console.log(`DB Hits: ${record.hits} | Real Hits: ${realHits}`);

        if (record.hits !== realHits) {
            console.error("❌ DISCREPANCY DETECTED!");
        } else {
            console.log("✅ Verified.");
        }
    }
}

verifyJackpots()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
