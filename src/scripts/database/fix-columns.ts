
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🛠️ A tentar adicionar colunas via SQL Raw...');
    await prisma.$executeRawUnsafe(`ALTER TABLE ranked_systems ADD COLUMN IF NOT EXISTS concept TEXT;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE ranked_systems ADD COLUMN IF NOT EXISTS logic TEXT;`);
    console.log('✅ Colunas concept e logic adicionadas com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao adicionar colunas:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
