require('dotenv').config();
const { PrismaClient } = require('@prisma/client-prod');

const prodUrl = process.env.POSTGRES_URL_PROD || 'postgresql://admin_magico:UmaSenhaForte123@172.16.16.6:5432/numeros_magicos_prod?connection_limit=1';

const prodPrisma = new PrismaClient({
    datasources: { db: { url: prodUrl } }
});

async function main() {
  try {
    const res = await prodPrisma.draw.groupBy({
      by: ['game'],
      _max: { date: true },
      _count: { id: true }
    });
    console.log('Database Status (Production VPS):');
    console.log(res);

    const totalDraws = await prodPrisma.draw.count();
    console.log('Total draws on VPS:', totalDraws);

    // Let's also check the latest update timestamp from log or DB
    const latestDraws = await Promise.all(
      ['EUROMILLIONS', 'EURODREAMS', 'TOTOLOTO', 'MEGASENA'].map(async (game) => {
        const d = await prodPrisma.draw.findFirst({
          where: { game },
          orderBy: { date: 'desc' }
        });
        return { game, date: d?.date, createdAt: d?.createdAt };
      })
    );
    console.log('\nLatest Draws detail:');
    console.log(latestDraws);

  } catch (err) {
    console.error('Error connecting to VPS database:', err);
  } finally {
    await prodPrisma.$disconnect();
  }
}

main().catch(console.error);
