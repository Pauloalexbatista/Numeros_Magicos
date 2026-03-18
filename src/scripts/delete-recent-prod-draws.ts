import { PrismaClient } from '@prisma/client';

// Use the local database
const prisma = new PrismaClient();

async function main() {
    console.log("Connecting to production database...");
    
    // The last good draw was 03/03/2026.
    // Let's delete anything with date > 2026-03-04 for EuroMillions.
    const cutoffDate = new Date('2026-03-04T00:00:00.000Z');

    const drawsToDelete = await prisma.draw.findMany({
        where: {
            game: 'EUROMILLIONS',
            date: {
                gt: cutoffDate
            }
        },
        orderBy: { date: 'asc' }
    });

    if (drawsToDelete.length === 0) {
        console.log("No draws found to delete after 2026-03-04. The database is already clean or the date is wrong.");
        return;
    }

    console.log("Found the following draws to delete:");
    drawsToDelete.forEach(d => {
        console.log(`- ID: ${d.id}, Date: ${d.date.toISOString().slice(0, 10)}, Sequence: ${d.sequenceNumber}`);
    });

    console.log("Proceeding with deletion...");
    
    // Due to the @@onDelete(Cascade) in the schema, this should also clean up predictive performances
    const deleteResult = await prisma.draw.deleteMany({
        where: {
            game: 'EUROMILLIONS',
            date: {
                gt: cutoffDate
            }
        }
    });

    console.log(`Successfully deleted ${deleteResult.count} draws.`);
    
    // Let's verify what the last remaining draw is now
    const lastDraw = await prisma.draw.findFirst({
        where: { game: 'EUROMILLIONS' },
        orderBy: { date: 'desc' }
    });
    
    if (lastDraw) {
        console.log(`The last draw in the database is now: ID ${lastDraw.id}, Date: ${lastDraw.date.toISOString().slice(0, 10)}`);
    } else {
        console.log("Warning: No draws left in the database for EUROMILLIONS.");
    }
}

main()
    .catch(e => {
        console.error("Fatal Error running deletion script:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
