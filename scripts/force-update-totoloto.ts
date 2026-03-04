import { TotolotoService } from '../src/services/totolotoService';
import { prisma } from '../src/lib/prisma';

async function forceUpdate() {
    console.log('🚀 FORCING TOTOLOTO UPDATE (March 4th)...');

    // Force specific URL to ensure we bypass any potential proxy/cache issues on the server
    const service = new TotolotoService();

    try {
        const result = await service.updateDatabase();
        console.log('Update Success?', result);

        if (result) {
            console.log('✅ TOTOLOTO UPDATED SUCCESSFULLY');
        } else {
            console.log('ℹ️ No new draw added (maybe it already exists or was missed).');
        }
    } catch (err) {
        console.error('Update Error:', err);
    }

    await prisma.$disconnect();
}

forceUpdate();
