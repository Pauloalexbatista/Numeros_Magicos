import { prisma } from '../../lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
    const email = 'teste@numeros.pt';
    const password = '123456';

    console.log(`🔍 Verifying credentials for: ${email}`);

    const user = await prisma.user.findUnique({
        where: { email }
    });

    if (!user) {
        console.error('❌ User not found!');
        return;
    }

    console.log('✅ User found.');
    console.log(`   ID: ${user.id}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Stored Hash: ${user.password}`);

    if (!user.password) {
        console.error('❌ No password set for user!');
        return;
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (isValid) {
        console.log('✅ Password MATCHES!');
    } else {
        console.error('❌ Password DOES NOT MATCH!');
        const newHash = await bcrypt.hash(password, 10);
        console.log(`   Expected hash for '123456': ${newHash}`);
    }
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
