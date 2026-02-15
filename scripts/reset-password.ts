import { prisma } from '../src/lib/prisma';
import bcrypt from 'bcryptjs';

async function resetPassword() {
    const email = 'pauloalexbatista@gmail.com';
    const newPassword = 'numeros123'; // Password temporária

    try {
        // Hash da nova password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Atualizar ou criar utilizador
        const user = await prisma.user.upsert({
            where: { email },
            update: {
                password: hashedPassword,
            },
            create: {
                email,
                name: 'Paulo Batista',
                password: hashedPassword,
                role: 'ADMIN',
            },
        });

        console.log('✅ Password redefinida com sucesso!');
        console.log('📧 Email:', email);
        console.log('🔑 Password temporária:', newPassword);
        console.log('👤 Utilizador:', user.name);
        console.log('\n⚠️  Por favor, altere a password após fazer login!');
    } catch (error) {
        console.error('❌ Erro ao redefinir password:', error);
    } finally {
        await prisma.$disconnect();
    }
}

resetPassword();
