import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


async function checkAdminUsers() {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
            }
        });

        console.log('\n📋 Utilizadores na base de dados:\n');
        users.forEach(user => {
            console.log(`Email: ${user.email}`);
            console.log(`Nome: ${user.name || 'N/A'}`);
            console.log(`Role: ${user.role}`);
            console.log(`ID: ${user.id}`);
            console.log('---');
        });

        const adminUsers = users.filter(u => u.role === 'ADMIN');
        console.log(`\n✅ Total de utilizadores: ${users.length}`);
        console.log(`👑 Utilizadores ADMIN: ${adminUsers.length}\n`);

    } catch (error) {
        console.error('❌ Erro ao verificar utilizadores:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkAdminUsers();
