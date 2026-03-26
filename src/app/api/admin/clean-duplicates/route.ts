
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

        console.log('🚀 API: Starting Deduplication Process...');
        const games = ['EUROMILLIONS', 'TOTOLOTO', 'EURODREAMS'];
        let totalRemoved = 0;

        for (const game of games) {
            const draws = await prisma.draw.findMany({
                where: { game },
                orderBy: { date: 'asc' }
            });

            const seen = new Map<string, number>();

            for (const draw of draws) {
                const isoDate = draw.date.toISOString().split('T')[0];
                const normalizedDate = new Date(isoDate + "T12:00:00Z");

                if (seen.has(isoDate)) {
                    const survivingId = seen.get(isoDate)!;

                    // Handle relations carefully to avoid unique constraint violations
                    // SystemPerformance
                    const duplicatePerformances = await prisma.systemPerformance.findMany({
                        where: { drawId: draw.id }
                    });
                    for (const perf of duplicatePerformances) {
                        const exists = await prisma.systemPerformance.findFirst({
                            where: { drawId: survivingId, systemName: perf.systemName, game: perf.game }
                        });
                        if (!exists) {
                            try {
                                await prisma.systemPerformance.update({ where: { id: perf.id }, data: { drawId: survivingId } });
                            } catch (e) {
                                await prisma.systemPerformance.delete({ where: { id: perf.id } });
                            }
                        } else {
                            await prisma.systemPerformance.delete({ where: { id: perf.id } });
                        }
                    }

                    // StarSystemPerformance
                    const duplicateStarPerformances = await prisma.starSystemPerformance.findMany({
                        where: { drawId: draw.id }
                    });
                    for (const perf of duplicateStarPerformances) {
                        const exists = await prisma.starSystemPerformance.findFirst({
                            where: { drawId: survivingId, systemName: perf.systemName, game: perf.game }
                        });
                        if (!exists) {
                            try {
                                await prisma.starSystemPerformance.update({ where: { id: perf.id }, data: { drawId: survivingId } });
                            } catch (e) {
                                await prisma.starSystemPerformance.delete({ where: { id: perf.id } });
                            }
                        } else {
                            await prisma.starSystemPerformance.delete({ where: { id: perf.id } });
                        }
                    }

                    // SystemPrediction
                    const duplicatePredictions = await prisma.systemPrediction.findMany({
                        where: { drawId: draw.id }
                    });
                    for (const pred of duplicatePredictions) {
                        const exists = await prisma.systemPrediction.findFirst({
                            where: { drawId: survivingId, systemName: pred.systemName, game: pred.game }
                        });
                        if (!exists) {
                            try {
                                await prisma.systemPrediction.update({ where: { id: pred.id }, data: { drawId: survivingId } });
                            } catch (e) {
                                await prisma.systemPrediction.delete({ where: { id: pred.id } });
                            }
                        } else {
                            await prisma.systemPrediction.delete({ where: { id: pred.id } });
                        }
                    }

                    await prisma.draw.delete({ where: { id: draw.id } });
                    totalRemoved++;
                } else {
                    seen.set(isoDate, draw.id);
                    if (draw.date.getTime() !== normalizedDate.getTime()) {
                        await prisma.draw.update({ where: { id: draw.id }, data: { date: normalizedDate } });
                    }
                }
            }
        }

        return NextResponse.json({ 
            success: true, 
            message: `Limpeza concluída. Removidos ${totalRemoved} duplicados.`,
            removedCount: totalRemoved
        });

    } catch (error: any) {
        console.error('Deduplication API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
