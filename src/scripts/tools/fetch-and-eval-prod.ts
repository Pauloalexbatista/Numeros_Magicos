import { PrismaClient } from '@prisma/client';
import { onNewDrawAdded } from '../../services/ranking-evaluator';

// Point standard prisma connection directly to production Postgres URL
process.env.DATABASE_URL = process.env.POSTGRES_URL_PROD;

const prisma = new PrismaClient({
    datasources: { db: { url: process.env.POSTGRES_URL_PROD } }
});

async function main() {
    console.log("=== RUNNING EVALUATION ON PRODUCTION POSTGRES FOR 22/06 ===");
    
    // Find latest draw of EuroDreams on Prod Postgres
    const latestDraw = await prisma.draw.findFirst({
        where: { game: 'EURODREAMS' },
        orderBy: { date: 'desc' }
    });

    if (latestDraw) {
        console.log(`Latest draw in Prod: Draw ID ${latestDraw.id}, Date: ${latestDraw.date.toISOString().split('T')[0]}`);
        
        // Let's run the evaluation. Since we override DATABASE_URL and the datasource url,
        // ranking-evaluator's prisma instance will point to production!
        // We evaluate this draw
        await onNewDrawAdded(latestDraw);
        
        console.log("Evaluation complete on production Postgres database!");
    } else {
        console.log("No EuroDreams draws found in production Postgres.");
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
