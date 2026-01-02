
import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
    // Explicitly load .env if DATABASE_URL is missing
    if (!process.env.DATABASE_URL) {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        require('dotenv').config();
    }

    // FORCE ABSOLUTE PATH (Temporary Fix for cached ENV)
    const url = "file:C:/Users/paulo/.gemini/antigravity/playground/core-omega/PRJT_Numeros_Magicos/prisma/dev.db";
    console.log("🐛 [LAB DEBUG] FORCE URL:", url);

    return new PrismaClient({
        datasources: {
            db: {
                url: url
            }
        }
    });
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClientSingleton | undefined;
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
