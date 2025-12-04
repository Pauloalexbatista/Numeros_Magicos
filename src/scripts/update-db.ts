
import { EuroMillionsService } from '@/services/euroMillionsService';
import { prisma } from '@/lib/prisma';

async function main() {
    console.log('🔄 Starting Database Update...');
    const service = new EuroMillionsService();
    await service.updateDatabase();
    console.log('✅ Database Update Complete.');
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
