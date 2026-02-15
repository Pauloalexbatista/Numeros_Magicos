
import { EuroMillionsService } from '../services/euroMillionsService';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const service = new EuroMillionsService();

async function main() {
    console.log('🚀 Starting Manual Update...');

    // Explicitly call updateDatabase which handles Gap Filling
    const hasNew = await service.updateDatabase();

    if (hasNew) {
        console.log('✅ Update successful! New draws found.');
    } else {
        console.log('ℹ️ No new draws found. Database is up to date.');
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
