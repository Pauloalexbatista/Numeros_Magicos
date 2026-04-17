
import { prisma } from '../../lib/prisma';

async function deduplicate() {
    const games = ['EURODREAMS', 'TOTOLOTO', 'EUROMILLIONS'];
    
    // Correct days of week (0=Sunday, 1=Monday, ..., 6=Saturday)
    const validDays: Record<string, number[]> = {
        'EURODREAMS': [1, 4],    // Monday, Thursday
        'EUROMILLIONS': [2, 5],  // Tuesday, Friday
        'TOTOLOTO': [3, 6]       // Wednesday, Saturday
    };

    console.log('🚀 Starting Intelligent Deduplication...');

    for (const game of games) {
        console.log(`\nProcessing ${game}...`);
        
        const draws = await prisma.draw.findMany({
            where: { game },
            orderBy: { date: 'asc' }
        });

        const toDelete: number[] = [];
        const seenNumbers = new Map<string, { id: number, date: Date }>();

        for (const draw of draws) {
            const numbersKey = draw.numbers;
            const drawDate = new Date(draw.date);
            const dayOfWeek = drawDate.getUTCDay();
            const isCorrectDay = validDays[game].includes(dayOfWeek);

            // Check if we've seen these numbers recently (within 10 days)
            // Strategy: Lotteries don't repeat the EXACT SAME 5/6 numbers in 10 days normally.
            // If we find a repeat, it's almost certainly a duplicate entry.
            const existing = seenNumbers.get(numbersKey);
            
            if (existing) {
                const diffDays = Math.abs(drawDate.getTime() - existing.date.getTime()) / (1000 * 60 * 60 * 24);
                
                if (diffDays <= 10) {
                    // It's a duplicate. Decide which one to keep.
                    const existingDay = existing.date.getUTCDay();
                    const existingIsCorrect = validDays[game].includes(existingDay);

                    if (existingIsCorrect && !isCorrectDay) {
                        // Current is on wrong day, existing is on right day. Delete current.
                        console.log(`  🗑️ Marking duplicate for deletion: ID ${draw.id} (${draw.date.toISOString()}, day ${dayOfWeek}) - Numbers match ID ${existing.id}`);
                        toDelete.push(draw.id);
                        continue; // Keep the existing one as the primary reference
                    } else if (!existingIsCorrect && isCorrectDay) {
                        // Current is on right day, existing is on wrong day. Delete existing.
                        console.log(`  🗑️ Marking old duplicate for deletion: ID ${existing.id} (${existing.date.toISOString()}, day ${existingDay}) - Numbers match ID ${draw.id}`);
                        toDelete.push(existing.id);
                        // Update seen to the current one (the better one)
                        seenNumbers.set(numbersKey, { id: draw.id, date: draw.date });
                    } else {
                        // Both same status? Keep the first one found (the "existing" one)
                        console.log(`  🗑️ Marking secondary duplicate for deletion: ID ${draw.id} (${draw.date.toISOString()})`);
                        toDelete.push(draw.id);
                        continue;
                    }
                }
            }

            // If not deleted, this is now our reference for these numbers
            seenNumbers.set(numbersKey, { id: draw.id, date: draw.date });
        }

        if (toDelete.length > 0) {
            console.log(`  🧹 Deleting ${toDelete.length} draws from ${game}...`);
            
            // Delete associated performances first (Prisma handles this if cascade is set, but extra safety)
            await prisma.systemPerformance.deleteMany({ where: { drawId: { in: toDelete } } });
            await prisma.starSystemPerformance.deleteMany({ where: { drawId: { in: toDelete } } });
            await prisma.systemPerformanceStaging.deleteMany({ where: { drawId: { in: toDelete } } });
            
            // Delete draws
            const result = await prisma.draw.deleteMany({
                where: { id: { in: toDelete } }
            });
            console.log(`  ✅ Successfully deleted ${result.count} records.`);
        } else {
            console.log(`  ✨ No duplicates found for ${game}.`);
        }
    }

    console.log('\n🏁 Deduplication process finished.');
}

deduplicate().catch(console.error).finally(() => prisma.$disconnect());
