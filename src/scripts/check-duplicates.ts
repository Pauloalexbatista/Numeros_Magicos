
import { prisma } from '../lib/prisma';

async function main() {
    console.log("Checking for duplicates in SystemPerformance...");

    // Group by drawId and systemName and filter count > 1
    const duplicates = await prisma.systemPerformance.groupBy({
        by: ['drawId', 'systemName'],
        _count: {
            id: true
        },
        having: {
            id: {
                _count: {
                    gt: 1
                }
            }
        }
    });

    if (duplicates.length === 0) {
        console.log("✅ No duplicates found in SystemPerformance. The database is clean.");
        console.log("The unique constraint @@unique([drawId, systemName]) is working correctly.");
    } else {
        console.error(`❌ FOUND ${duplicates.length} DUPLICATE GROUPS!`);
        console.log(JSON.stringify(duplicates, null, 2));
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
