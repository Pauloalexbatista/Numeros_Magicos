import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const email = 'pauloalexbatista@gmail.com';
    const password = '123456'; // Temporary password as requested
    const name = 'Paulo Batista';

    console.log(`Checking for user: ${email}...`);

    const existingUser = await prisma.user.findUnique({
        where: { email }
    });

    const hashedPassword = await bcrypt.hash(password, 10);

    if (existingUser) {
        console.log('User exists. Updating to ADMIN and setting password...');
        await prisma.user.update({
            where: { email },
            data: {
                password: hashedPassword,
                role: 'ADMIN',
                newsletterOptIn: true
            }
        });
        console.log('User updated successfully.');
    } else {
        console.log('User not found. Creating new ADMIN user...');
        await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: 'ADMIN',
                newsletterOptIn: true
            }
        });
        console.log('User created successfully.');
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
