
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

async function resetAccess() {
    const email = 'miguellopbatista2008@gmail.com';
    console.log(`🔐 Resetando acesso para: ${email}...`);

    const hashedPassword = await bcrypt.hash('123456', 10);

    try {
        await prisma.user.update({
            where: { email },
            data: {
                password: hashedPassword,
                emailVerified: new Date(), // Mark as verified
            }
        });
        console.log('✅ SUCESSO! Senha alterada para "123456" e email verificado.');
    } catch (error) {
        console.error('❌ Erro ao atualizar utilizador:', error);
    }
}

resetAccess()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
