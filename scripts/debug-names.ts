import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

async function main() {
    const systems = await prisma.rankedSystem.findMany({ where: { game: 'EURODREAMS', domain: 'STARS' } });
    console.log('EuroDreams Ranked Systems (STARS):', systems.map(s => s.name));
}
main().finally(() => prisma.$disconnect());
