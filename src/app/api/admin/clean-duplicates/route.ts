
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const secret = searchParams.get('secret');

        if (secret !== 'magia2026') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.log('🚀 API: Starting Robust Deduplication Process...');
        const games = ['EUROMILLIONS', 'TOTOLOTO', 'EURODREAMS'];
        let totalRemoved = 0;

        for (const game of games) {
            const draws = await prisma.draw.findMany({
                where: { game },
                orderBy: { date: 'asc' }
            });

            // Group by YYYY-MM-DD
            const grouped = new Map<string, any[]>();
            for (const d of draws) {
                const day = d.date.toISOString().split('T')[0];
                if (!grouped.has(day)) grouped.set(day, []);
                grouped.get(day)!.push(d);
            }

            for (const [day, group] of grouped.entries()) {
                // Determine a master draw (preferably one already at 12:00:00)
                let master = group.find(d => d.date.getUTCHours() === 12) || group[0];
                const normalizedDate = new Date(`${day}T12:00:00Z`);

                // 1. Ensure master is at 12:00:00Z
                if (master.date.getTime() !== normalizedDate.getTime()) {
                    try {
                        master = await prisma.draw.update({
                            where: { id: master.id },
                            data: { date: normalizedDate }
                        });
                    } catch (e) {
                        // If it fails, maybe another draw with 12:00 was just created or exists
                        // Let's try to find it
                        const existingMaster = await prisma.draw.findFirst({
                            where: { game, date: normalizedDate }
                        });
                        if (existingMaster && existingMaster.id !== master.id) {
                            master = existingMaster;
                        }
                    }
                }

                // 2. Merge others into master
                for (const draw of group) {
                    if (draw.id === master.id) continue;

                    console.log(`   Merging ${draw.id} into ${master.id} (${day})`);

                    // SystemPerformance
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

                    // StarSystemPerformance
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

                    // SystemPrediction
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

        return NextResponse.json({ 
            success: true, 
            message: totalRemoved > 0 
                ? `Limpeza concluída com sucesso! Removidos ${totalRemoved} duplicados.` 
                : "A base de dados já está limpa e íntegra.",
            removedCount: totalRemoved
        });

    } catch (error: any) {
        console.error('Deduplication API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
