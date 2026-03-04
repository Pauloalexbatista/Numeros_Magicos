import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient({
    datasources: { db: { url: process.env.POSTGRES_URL_PROD } }
});

async function run() {
    const systems = await prisma.rankedSystem.findMany();
    console.log('Systems in Prod DB:', systems.length);
    systems.forEach(s => console.log(` - ${s.name} (${s.domain})`));
}

run()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
