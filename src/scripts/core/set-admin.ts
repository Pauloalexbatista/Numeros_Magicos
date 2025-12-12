
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function setAdmin(email: string) {
    if (!email) {
        console.error('❌ Please provide an email address.');
        process.exit(1);
    }

    try {
        const user = await prisma.user.update({
            where: { email },
            data: { role: 'ADMIN' },
        });
        console.log(`✅ User ${user.email} is now an ADMIN.`);
    } catch (error) {
        console.error('❌ Error updating user:', error);
    } finally {
        await prisma.$disconnect();
    }
}

const email = process.argv[2];
setAdmin(email);
