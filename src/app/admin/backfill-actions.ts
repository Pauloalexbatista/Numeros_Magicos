'use server';

import { prisma } from '@/lib/prisma';
import { evaluateDraw, updateRanking, cachePredictions, evaluateDrawStars } from '@/services/ranking';

export interface BackfillStatus {
    total: number;
    processed: number;
    remaining: number;
    percentage: number;
}

export async function getBackfillStatus(game: string = 'EUROMILLIONS'): Promise<BackfillStatus> {
    const total = await prisma.draw.count({ where: { game } });

    // Benchmark system to check if draw is "processed"
    // For EuroMillions: "Sistema Ouro"
    // For others, we just check if ANY system performance exists for that draw
    const benchmarkSystem = game === 'EUROMILLIONS' ? 'Sistema Ouro' : undefined;

    let processed;
    if (benchmarkSystem) {
        processed = await prisma.systemPerformance.count({
            where: {
                systemName: benchmarkSystem,
                draw: { game }
            }
        });
    } else {
        // Count draws of this game that have at least one performance record
        const drawsWithPerf = await prisma.draw.count({
            where: {
                game,
                systemPerformances: {
                    some: {}
                }
            }
        });
        processed = drawsWithPerf;
    }

    const remaining = total - processed;
    const percentage = total > 0 ? (processed / total) * 100 : 0;

    return {
        total,
        processed,
        remaining,
        percentage: parseFloat(percentage.toFixed(1))
    };
}

export async function processBackfillBatch(
    batchSize: number = 10,
    game: string = 'EUROMILLIONS'
): Promise<{ success: boolean, processed: number, message: string }> {
    try {
        const benchmarkSystem = game === 'EUROMILLIONS' ? 'Sistema Ouro' : undefined;

        // 1. Find draws missing performance data
        let missingDraws;

        if (benchmarkSystem) {
            missingDraws = await prisma.draw.findMany({
                where: {
                    game,
                    NOT: {
                        systemPerformances: {
                            some: { systemName: benchmarkSystem }
                        }
                    }
                },
                orderBy: { date: 'asc' },
                take: batchSize
            });
        } else {
            missingDraws = await prisma.draw.findMany({
                where: {
                    game,
                    systemPerformances: {
                        none: {}
                    }
                },
                orderBy: { date: 'asc' },
                take: batchSize
            });
        }

        if (missingDraws.length === 0) {
            return { success: true, processed: 0, message: `Todos os sorteios de ${game} estão atualizados!` };
        }

        // 2. Process each draw
        for (const draw of missingDraws) {
            await evaluateDraw(draw.id);
            // Also evaluate stars if it is supported (e.g. EuroMillions, EuroDreams, Totoloto)
            try {
                await evaluateDrawStars(draw.id);
            } catch (starErr) {
                console.warn(`Aviso: Falha ao avaliar estrelas para sorteio ${draw.id}:`, starErr);
            }
        }

        // 3. Update Rankings
        await updateRanking();

        // 4. Cache Predictions (only if finished)
        // Check remaining
        const remainingCount = await prisma.draw.count({
            where: {
                game,
                NOT: {
                    systemPerformances: {
                        some: {}
                    }
                }
            }
        });

        if (remainingCount === 0) {
            console.log(`Backfill de ${game} concluído. A atualizar cache...`);
            await cachePredictions();
        }

        return {
            success: true,
            processed: missingDraws.length,
            message: `Processados ${missingDraws.length} sorteios de ${game}.`
        };

    } catch (error) {
        console.error(`Falha no backfill batch (${game}):`, error);
        return {
            success: false,
            processed: 0,
            message: error instanceof Error ? error.message : 'Erro desconhecido durante o backfill'
        };
    }
}
