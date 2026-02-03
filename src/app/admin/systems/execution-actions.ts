'use server';

import { prisma } from '@/lib/prisma';
import { evaluateDraw, evaluateDrawStars } from '@/services/ranking';

export async function executeCalculation(params: {
    game: 'EUROMILLIONS' | 'TOTOLOTO' | 'EURODREAMS';
    systemTypes: ('BASE' | 'NEURAL' | 'ENSEMBLE')[];
    includeStars: boolean;
}) {
    try {
        // Get latest draw for the game
        const latestDraw = await prisma.draw.findFirst({
            where: { game: params.game },
            orderBy: { date: 'desc' }
        });

        if (!latestDraw) {
            return {
                success: false,
                error: `Nenhum sorteio encontrado para ${params.game}`
            };
        }

        // Calculate numbers
        await evaluateDraw(latestDraw.id, {
            systemTypes: params.systemTypes,
            domain: 'NUMBERS'
        });

        // Calculate stars if requested
        if (params.includeStars) {
            await evaluateDrawStars(latestDraw.id, {
                systemTypes: params.systemTypes
            });
        }

        // Count results
        const performanceCount = await prisma.systemPerformance.count({
            where: { drawId: latestDraw.id }
        });

        return {
            success: true,
            drawDate: latestDraw.date.toISOString().split('T')[0],
            systemsCalculated: performanceCount
        };
    } catch (error: any) {
        return {
            success: false,
            error: error.message
        };
    }
}

export async function getLatestDrawInfo(game: string) {
    const draw = await prisma.draw.findFirst({
        where: { game },
        orderBy: { date: 'desc' },
        include: {
            systemPerformances: true
        }
    });

    if (!draw) return null;

    return {
        date: draw.date.toISOString().split('T')[0],
        sequenceNumber: draw.sequenceNumber,
        performancesCount: draw.systemPerformances.length
    };
}
