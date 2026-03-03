
import { prismaProd } from '../../lib/prisma-prod';

async function checkMaxId() {
    console.log('🔍 Checking Max Draw ID in Production...\n');

    const lastDraw = await (prismaProd as any).draw.findFirst({
        orderBy: { id: 'desc' }
    });

    if (lastDraw) {
        console.log(`✅ Max ID: ${lastDraw.id}`);
        console.log(`📅 Date: ${lastDraw.date}`);
        console.log(`🎮 Game: ${lastDraw.game}`);
    } else {
        console.log('❌ No draws found in Production.');
    }
}

checkMaxId()
    .catch(console.error)
    .finally(() => (prismaProd as any).$disconnect());
