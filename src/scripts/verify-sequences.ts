
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verify() {
    console.log('Fetching all draws...');
    const draws = await prisma.draw.findMany({
        orderBy: { date: 'desc' }
    });
    console.log(`Total draws found: ${draws.length}`);

    // Parse numbers
    const parsedDraws = draws.map(d => ({
        date: d.date,
        numbers: JSON.parse(d.numbers as string) as number[]
    }));

    // Chronological order (Oldest -> Newest)
    const chronological = [...parsedDraws].reverse();

    const maxSequences: Record<number, number> = {};
    const maxAbsences: Record<number, number> = {};

    for (let i = 1; i <= 50; i++) {
        let currentSeq = 0;
        let currentAbs = 0;
        let maxSeq = 0;
        let maxAbs = 0;

        for (const draw of chronological) {
            if (draw.numbers.includes(i)) {
                currentSeq++;
                currentAbs = 0;
            } else {
                currentAbs++;
                currentSeq = 0;
            }

            if (currentSeq > maxSeq) maxSeq = currentSeq;
            if (currentAbs > maxAbs) maxAbs = currentAbs;
        }
        maxSequences[i] = maxSeq;
        maxAbsences[i] = maxAbs;
    }

    // Sort and print Top 5 Sequences
    const sortedSequences = Object.entries(maxSequences)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);

    console.log('\n--- Top 5 Max Sequences ---');
    sortedSequences.forEach(([num, seq]) => {
        console.log(`Number ${num}: ${seq} times in a row`);
    });

    // Sort and print Top 5 Absences
    const sortedAbsences = Object.entries(maxAbsences)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);

    console.log('\n--- Top 5 Max Absences ---');
    sortedAbsences.forEach(([num, abs]) => {
        console.log(`Number ${num}: ${abs} draws missed`);
    });
}

verify()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
