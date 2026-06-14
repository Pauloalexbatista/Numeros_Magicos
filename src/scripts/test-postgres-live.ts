import { PrismaClient } from '@prisma/client-prod';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.POSTGRES_URL_PROD
        }
    }
});

async function main() {
    console.log('Clearing User table in PostgreSQL...');
    const result = await prisma.user.deleteMany();
    console.log(`✅ Cleared User table. Deleted ${result.count} records.`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
