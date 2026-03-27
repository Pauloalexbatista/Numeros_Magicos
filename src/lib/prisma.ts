import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const getDatabaseUrl = () => {
  // Priority order for production connection strings
  let url = process.env.DATABASE_URL;
  
  // Detect if we are in production (Docker or VPS)
  const isProd = process.env.NODE_ENV === 'production' || process.env.VERCEL === 'true';

  // Fallback check: if no URL or legacy Neon URL, try VPS direct Postgres
  if (!url || url.includes('neon.tech')) {
     url = process.env.DATABASE_URL_VPS || process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL || 'file:./prisma/dev.db';
  }
  
  if (isProd) {
    const isPostgres = url.startsWith('postgres') || url.startsWith('postgresql');
    const type = isPostgres ? '🐘 PostgreSQL' : '📦 SQLite';
    
    // Obfuscate sensitive part for logging
    const host = url.includes('@') ? url.split('@')[1].split('/')[0] : 'internal';
    console.log(`[Prisma] 🚀 Production engine: ${type} at ${host}`);
    
    // Safety check: if Postgres is expected but SQLite found, warn
    if (!isPostgres && process.env.DATABASE_URL?.startsWith('postgres')) {
      console.warn('[Prisma] ⚠️ WARNING: Expected Postgres but falling back to SQLite! Check .env variables.');
    }
  }
  
  return url;
};

const databaseUrl = getDatabaseUrl();

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
