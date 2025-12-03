import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
    const email = 'teste@numeros.pt';
    const password = '123456';
    const name = 'Utilizador de Teste';

    console.log(`👤 Creating test user: ${email}...`);

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.upsert({
        where: { email },
        update: {
            password: hashedPassword,
            role: 'USER', // Ensure it's a normal user
            name
        },
        create: {
            email,
            password: hashedPassword,
            name,
            role: 'USER',
            newsletterOptIn: true
        }
    });

    console.log(`✅ User created/updated successfully!`);
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Password: ${password}`);
    console.log(`🎭 Role: ${user.role}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
