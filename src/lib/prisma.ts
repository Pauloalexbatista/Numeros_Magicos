import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const getDatabaseUrl = () => {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL_PROD || 'file:./dev.db';
  
  // Log (obfuscated) for debugging production issues
  if (process.env.NODE_ENV === 'production') {
    const type = url.startsWith('file:') ? 'SQLite' : 'Postgres';
    const host = url.split('@')[1]?.split(':')[0] || 'internal';
    console.log(`[Prisma] Initializing with ${type} at ${host}`);
  }
  
  return url;
};

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: getDatabaseUrl(),
      },
    },
  });
