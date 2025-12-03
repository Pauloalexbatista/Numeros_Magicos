import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
    const email = 'hugoandre@net.sapo.pt';
    const password = '123456';
    const name = 'Hugo André';

    console.log(`👤 Creating Admin user: ${email}...`);

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.upsert({
        where: { email },
        update: {
            password: hashedPassword,
            role: 'ADMIN', // Set as ADMIN
            name
        },
        create: {
            email,
            password: hashedPassword,
            name,
            role: 'ADMIN',
            newsletterOptIn: true
        }
    });

    console.log(`✅ Admin created/updated successfully!`);
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
