
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Starting Robust Deduplication Process...');
    const games = ['EUROMILLIONS', 'TOTOLOTO', 'EURODREAMS'];
    let totalRemoved = 0;

    for (const game of games) {
        console.log(`📦 Processing ${game}...`);
        const draws = await prisma.draw.findMany({
            where: { game },
            orderBy: { date: 'asc' }
        });

        // Group by YYYY-MM-DD string
        const grouped = new Map<string, any[]>();
        for (const d of draws) {
            const day = d.date.toISOString().split('T')[0];
            if (!grouped.has(day)) grouped.set(day, []);
            grouped.get(day)!.push(d);
        }

        for (const [day, group] of grouped.entries()) {
            const normalizedDate = new Date(`${day}T12:00:00Z`);
            
            // Pick a master (preferably one at 12h)
            let master = group.find(d => d.date.getUTCHours() === 12) || group[0];

            // 1. Ensure master date is correct
            if (master.date.getTime() !== normalizedDate.getTime()) {
                try {
                    master = await prisma.draw.update({
                        where: { id: master.id },
                        data: { date: normalizedDate }
                    });
                } catch (e) {
                    const existingMaster = await prisma.draw.findFirst({
                        where: { game, date: normalizedDate }
                    });
                    if (existingMaster) master = existingMaster;
                }
            }

            // 2. Merge siblings
            for (const draw of group) {
                if (draw.id === master.id) continue;

                console.log(`   Merging ID ${draw.id} -> ${master.id} (${day})`);

                // Performances
                const perfs = await prisma.systemPerformance.findMany({ where: { drawId: draw.id } });
                for (const p of perfs) {
                    const exists = await prisma.systemPerformance.findFirst({
                        where: { drawId: master.id, systemName: p.systemName, game: p.game }
                    });
                    if (!exists) {
                        try {
                            await prisma.systemPerformance.update({ where: { id: p.id }, data: { drawId: master.id } });
                        } catch (e) { await prisma.systemPerformance.delete({ where: { id: p.id } }); }
                    } else {
                        await prisma.systemPerformance.delete({ where: { id: p.id } });
                    }
                }

                // Star Performances
                const starPerfs = await prisma.starSystemPerformance.findMany({ where: { drawId: draw.id } });
                for (const p of starPerfs) {
                    const exists = await prisma.starSystemPerformance.findFirst({
                        where: { drawId: master.id, systemName: p.systemName, game: p.game }
                    });
                    if (!exists) {
                        try {
                            await prisma.starSystemPerformance.update({ where: { id: p.id }, data: { drawId: master.id } });
                        } catch (e) { await prisma.starSystemPerformance.delete({ where: { id: p.id } }); }
                    } else {
                        await prisma.starSystemPerformance.delete({ where: { id: p.id } });
                    }
                }

                // Predictions
                const preds = await prisma.systemPrediction.findMany({ where: { drawId: draw.id } });
                for (const p of preds) {
                    const exists = await prisma.systemPrediction.findFirst({
                        where: { drawId: master.id, systemName: p.systemName, game: p.game }
                    });
                    if (!exists) {
                        try {
                            await prisma.systemPrediction.update({ where: { id: p.id }, data: { drawId: master.id } });
                        } catch (e) { await prisma.systemPrediction.delete({ where: { id: p.id } }); }
                    } else {
                        await prisma.systemPrediction.delete({ where: { id: p.id } });
                    }
                }

                await prisma.draw.delete({ where: { id: draw.id } });
                totalRemoved++;
            }
        }
    }

    console.log(`\n✨ Finished! Removed ${totalRemoved} duplicate draws.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
