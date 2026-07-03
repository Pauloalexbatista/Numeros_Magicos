require('dotenv').config();
const { PrismaClient } = require('@prisma/client-prod');

const prodUrl = process.env.POSTGRES_URL_PROD || 'postgresql://admin_magico:UmaSenhaForte123@172.16.16.6:5432/numeros_magicos_prod?connection_limit=1';

const prodPrisma = new PrismaClient({
    datasources: { db: { url: prodUrl } }
});

async function check() {
    try {
        const p1 = await prodPrisma.systemRanking.findFirst({ where: { systemName: 'Diagonais da Matriz', game: 'TOTOLOTO' } });
        console.log('PROD TOTOLOTO Diagonais da Matriz:', p1);
    } catch(e) {
        console.error('Error:', e);
    } finally {
        await prodPrisma.$disconnect();
    }
}

check();
