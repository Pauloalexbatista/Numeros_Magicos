
import { EuroMillionsService } from '@/services/euroMillionsService';
import { prisma } from '@/lib/prisma';

async function main() {
    const service = new EuroMillionsService();
    console.log("Force fetching 2026 archive...");
    const added = await service.seedFromArchive(2026);
    console.log(`Added ${added} draws from 2026 archive.`);
}

main().catch(console.error);
