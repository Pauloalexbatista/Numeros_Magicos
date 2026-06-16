import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const getDatabaseUrl = () => {
  // Priority order for production connection strings
  let url = process.env.DATABASE_URL;
  
  // Check the active schema provider without Node.js fs/path APIs (Edge Runtime safe)
  let isSqliteSchema = true;
  if (url && (url.startsWith('postgres') || url.startsWith('postgresql'))) {
    isSqliteSchema = false;
  } else if (process.env.DATABASE_URL_VPS || process.env.POSTGRES_PRISMA_URL) {
    isSqliteSchema = false;
  } else if (process.env.NODE_ENV === 'production' && !url) {
    // In production build, if DATABASE_URL is not set yet, we default to PostgreSQL
    isSqliteSchema = false;
  }

  // Detect if we are in production
  const isProd = process.env.NODE_ENV === 'production' || process.env.VERCEL === 'true' || !!process.env.COOLIFY_APP_ID;

  // STRATEGY: In production (VPS), we want to avoid Neon if a local VPS URL exists
  const isNeon = url && url.includes('neon.tech');
  
  if (isProd) {
    if (!isSqliteSchema) {
      // If we're on the VPS (Coolify/Docker), we should prefer the internal URL if already set correctly.
      // If DATABASE_URL is somehow empty or still pointing to Neon, then we use the VPS fallback.
      const preferredUrl = process.env.DATABASE_URL_VPS || process.env.POSTGRES_PRISMA_URL;
      
      // Improved detection: if url is missing, or is Neon, OR is SQLite (but we expect Postgres)
      const isSqlite = url && url.startsWith('file:');
      
      if (preferredUrl && (isNeon || !url || isSqlite)) {
        console.log('[Prisma] 🔄 Redirecting: Neon/SQLite/Empty detects in Prod. Switching to VPS Engine.');
        url = preferredUrl;
      }
    }
    
    // CRITICAL: During Docker BUILD phase, we often don't have DB access.
    // We detect if we are in build mode (NEXT_PHASE=phase-production-build)
    const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build' || process.env.IS_BUILD_STAGING === 'true';
    if (isBuildPhase) {
      if (isSqliteSchema) {
        console.log('[Prisma] 🏗️ Build phase detected with SQLite schema. Using local database path.');
        return url || 'file:./prisma/dev.db';
      }
      // If we don't have a postgres URL, we MUST provide one for validation to pass even in build
      if (!url || !url.startsWith('postgres')) {
          console.log('[Prisma] 🏗️ Build phase detected. Using dummy Postgres URL for validation.');
          return 'postgresql://dummy:dummy@localhost:5432/dummy';
      }
      console.log('[Prisma] 🏗️ Build phase detected. Using provided connection for static generation.');
    }
  }

  // Final fallback to dev SQLite if still nothing after all attempts
  if (!url) {
     url = 'file:./prisma/dev.db';
  }
  
  if (isProd) {
    const isPostgres = url.startsWith('postgres') || url.startsWith('postgresql');
    const type = isPostgres ? '🐘 PostgreSQL' : '📦 SQLite';
    
    // Obfuscate sensitive part for logging
    const host = url.includes('@') ? url.split('@')[1].split('/')[0] : 'internal';
    console.log(`[Prisma] 🚀 Production engine: ${type} at ${host}`);
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
