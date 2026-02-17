
import { prismaProd } from '../../lib/prisma-prod';

async function checkUsers() {
    console.log('Checking Production Users...');
    const userCount = await prismaProd.user.count();
    console.log(`Production Users: ${userCount}`);

    if (userCount > 0) {
        const firstUser = await prismaProd.user.findFirst();
        console.log('First User:', firstUser?.email, firstUser?.role);
    }
}

checkUsers().catch(console.error).finally(() => prismaProd.$disconnect());
