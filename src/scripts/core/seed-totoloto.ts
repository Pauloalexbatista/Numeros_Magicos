
import { TotolotoService } from '@/services/totolotoService';
import { initializeSystems, backfillRankings } from '@/services/ranking';
import { prisma } from '@/lib/prisma'; // Ensure disconnect

async function main() {
    console.log('🌱 Starting Totoloto Historical Import...');

    // 1. Initialize Systems (Register Totoloto systems)
    console.log('🛠 Initializing Systems...');
    await initializeSystems();

    const service = new TotolotoService();

    // Default to 2016 (10 years)
    // Or user can pass a year as arg
    const limitYear = process.argv[2] ? parseInt(process.argv[2]) : 2016;

    console.log(`Targeting data back to ${limitYear}`);

    const count = await service.seedFromArchive(limitYear);

    console.log(`🏁 Import complete. Processed/Added ${count} draws.`);

    if (count > 0 || limitYear < 2026) {
        console.log('📊 Backfilling performance for recent draws...');
        // Backfill roughly the amount we imported + some buffer, cap at 200 to be safe
        const backfillCount = Math.min(count + 50, 200);
        await backfillRankings(backfillCount);
    }
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
