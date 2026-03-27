import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const getDatabaseUrl = () => {
  // Priority order for production connection strings
  let url = process.env.DATABASE_URL;
  
  // Detect if we are in production
  const isProd = process.env.NODE_ENV === 'production' || process.env.VERCEL === 'true' || !!process.env.COOLIFY_APP_ID;

  // STRATEGY: In production (VPS), we want to avoid Neon if a local VPS URL exists
  const isNeon = url && url.includes('neon.tech');
  
  if (isProd) {
    // If we're on the VPS (Coolify/Docker), we should ALWAYS prefer the Docker-Internal or Direct-VPS URL
    const preferredUrl = process.env.DATABASE_URL_VPS || process.env.POSTGRES_PRISMA_URL;
    
    if (preferredUrl && (isNeon || !url)) {
      console.log('[Prisma] 🔄 Redirecting: Legacy Neon/Empty URL detected in Prod. Switching to VPS Engine.');
      url = preferredUrl;
    }
  }

  // Final fallback to dev SQLite if still nothing
  if (!url) {
     url = 'file:./prisma/dev.db';
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
