import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['error'],
    datasources: {
      db: {
        // Preference: 1. DATABASE_URL, 2. POSTGRES_PRISMA_URL, 3. Local SQLite
        url: process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL || 'file:./dev.db',
      },
    },
  });
