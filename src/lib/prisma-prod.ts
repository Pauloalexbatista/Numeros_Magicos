
// @ts-ignore
import { PrismaClient } from '../../node_modules/@prisma/client-prod';

const prismaClientSingleton = () => {
    return new PrismaClient({
        datasources: {
            db: {
                url: process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL_PROD
            }
        }
    })
}

const globalForPrisma = globalThis as unknown as { prismaProd: any | undefined }

export const prismaProd = globalForPrisma.prismaProd ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prismaProd = prismaProd
