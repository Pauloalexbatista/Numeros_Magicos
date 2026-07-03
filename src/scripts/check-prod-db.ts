import { PrismaClient } from '@prisma/client';

async function main() {
  // Let's print out the current DATABASE_URL to verify if it connects to production
  console.log('Connecting using DATABASE_URL:', process.env.DATABASE_URL?.split('@')[1] || 'Not configured / Local dev.db');
  
  const prisma = new PrismaClient();
  try {
    const res = await prisma.draw.groupBy({
      by: ['game'],
      _max: { date: true },
      _count: { id: true }
    });
    console.log('Database Status (Current Config):');
    console.log(res);
  } catch (err) {
    console.error('Error connecting to database:', err);
  }
}

main().catch(console.error);
