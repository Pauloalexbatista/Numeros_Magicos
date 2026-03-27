import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const getDatabaseUrl = () => {
  // Use the principal DATABASE_URL if it exists. 
  // We prioritize it over legacy Neon variables which might be stuck in the VPS environment.
  let url = process.env.DATABASE_URL;
  
  // If no DATABASE_URL or if it specifically points to the quota-exceeded Neon, 
  // try to find a better one or fallback to SQLite.
  if (!url || url.includes('neon.tech')) {
     url = process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL_PROD || 'file:./prisma/dev.db';
  }
  
  // Log (obfuscated) for debugging production issues
  if (process.env.NODE_ENV === 'production' || process.env.VERCEL === 'true') {
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
