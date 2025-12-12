
import { prisma } from '@/lib/prisma';

async function checkUsers() {
    console.log('🔍 Verificando utilizadores na base de dados...');
    const users = await prisma.user.findMany();

    if (users.length === 0) {
        console.log('❌ NENHUM utilizador encontrado! A base de dados foi limpa.');
        console.log('👉 Solução: Registre-se novamente na aplicação.');
    } else {
        console.log(`✅ Encontrados ${users.length} utilizadores:`);
        users.forEach(u => {
            console.log(` - ${u.email} (Verificado: ${u.emailVerified ? 'Sim' : 'Não'})`);
        });
    }
}

checkUsers()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
