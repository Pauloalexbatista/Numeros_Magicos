
import { EuroMillionsService } from '../../services/euroMillionsService';
import { prisma } from '@/lib/prisma';

async function main() {
    console.log('🌍 Connecting to EuroMillions API...');

    // Instantiate service
    const service = new EuroMillionsService();

    // Call updateDatabase which fetches and saves if new
    const added = await service.updateDatabase();

    if (added) {
        console.log('✨ New draw found and saved!');
    } else {
        console.log('💤 No new draw found (or checking failed).');
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
