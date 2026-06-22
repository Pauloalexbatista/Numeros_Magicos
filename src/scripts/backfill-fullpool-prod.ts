/**
 * Production backfill script for SystemPerformanceFullPool
 * Uses @prisma/client-prod (PostgreSQL) and the full system implementations.
 * 
 * Run: npx tsx src/scripts/backfill-fullpool-prod.ts EURODREAMS 5
 */
import { PrismaClient } from '@prisma/client-prod';
import { rankedSystems, euroDreamsRankedSystems, totolotoRankedSystems } from '../services/ranking';
import { IPredictiveSystem } from '../services/ranked-systems';
import { updateRanking, cachePredictions } from '../services/ranking';

// Load .env
import 'dotenv/config';

const game = process.argv[2] || 'EURODREAMS';
const limit = parseInt(process.argv[3] || '3', 10);

const prodUrl = process.env.POSTGRES_URL_PROD;

if (!prodUrl) {
    console.error('POSTGRES_URL_PROD not set!');
    process.exit(1);
}

const prisma = new PrismaClient({
    datasources: { db: { url: prodUrl } }
}) as any;

async function main() {
    console.log(`\n=== Production FullPool Backfill for ${game} (last ${limit} draws) ===\n`);
    console.log(`Using PostgreSQL at: ${prodUrl?.split('@')[1]?.split('/')[0]}`);
    
    // 1. Get system instances
    let systemInstances: IPredictiveSystem[] = [];
    if (game === 'TOTOLOTO') systemInstances = totolotoRankedSystems as any;
    else if (game === 'EURODREAMS') systemInstances = euroDreamsRankedSystems as any;
    else systemInstances = rankedSystems as any;
    
    // 2. Get active systems from production DB
    const dbSystems = await prisma.rankedSystem.findMany({
        where: { game, domain: 'NUMBERS', isActive: true }
    });
    
    console.log(`Active systems in production: ${dbSystems.length}`);
    
    const matchedSystems = systemInstances.filter((s: IPredictiveSystem) => dbSystems.some((db: any) => db.name === s.name));
    console.log(`Matched instances: ${matchedSystems.length}`);
    
    // 3. Get recent draws from production
    const recentDraws = await prisma.draw.findMany({
        where: { game },
        orderBy: { date: 'desc' },
        take: limit,
        select: { id: true, date: true, numbers: true, stars: true }
    });
    
    recentDraws.reverse(); // Process oldest first
    
    for (const draw of recentDraws) {
        const existingCount = await prisma.systemPerformanceFullPool.count({
            where: { drawId: draw.id }
        });
        
        if (existingCount >= matchedSystems.length) {
            console.log(`\n  ? [${draw.date.toISOString().split('T')[0]}] Already has ${existingCount} entries. Skipping.`);
            continue;
        }
        
        console.log(`\n  ?? [${draw.date.toISOString().split('T')[0]}] Has ${existingCount}/${matchedSystems.length} entries. Backfilling...`);
        
        // Get history from production
        const history = await prisma.draw.findMany({
            where: { game, date: { lt: draw.date } },
            orderBy: { date: 'desc' },
            take: 500
        });
        
        if (history.length < 50) {
            console.log(`    ?? Insufficient history (${history.length} draws). Skipping.`);
            continue;
        }
        
        // Convert history to format expected by systems
        const typedHistory = history.map((d: any) => ({
            ...d,
            numbers: typeof d.numbers === 'string' ? JSON.parse(d.numbers) : d.numbers,
            stars: typeof d.stars === 'string' ? JSON.parse(d.stars) : d.stars
        }));
        
        let added = 0;
        for (const system of matchedSystems) {
            const existing = await prisma.systemPerformanceFullPool.findFirst({
                where: { drawId: draw.id, systemName: (system as any).name, game }
            });
            
            if (existing) continue;
            
            try {
                const fullPool = await (system as any).generateTop10(typedHistory, true);
                
                await prisma.systemPerformanceFullPool.create({
                    data: {
                        drawId: draw.id,
                        game,
                        systemName: (system as any).name,
                        predictedNumbers: JSON.stringify(fullPool),
                        actualNumbers: draw.numbers
                    }
                });
                added++;
                console.log(`    ? ${(system as any).name} (${fullPool.length} nums)`);
            } catch (err: any) {
                console.error(`    ? ${(system as any).name}: ${err.message}`);
            }
        }
        
        console.log(`    ? Added ${added} new entries for draw ${draw.id}`);
    }
    
    console.log(`\n? FullPool backfill complete for ${game}!`);
}

main()
    .catch(err => { console.error('? Fatal:', err); process.exit(1); })
    .finally(() => prisma.$disconnect());
